import { join } from 'path';
import { createFolder, getFileStats, hasWriteAccess, readFile, writeFile } from '../../utils/fs.js';
import { fetchMfaCredentials } from '../internal/tools/fetchMfaCredentials.js';
import EnvironmentError from '../../utils/errors/EnvironmentError.js';
import { getLog } from '../../utils/log.js';

const log = getLog('updateMfaProfile');

const MFA_PROFILE_NEEDLE = '[profile mfa]';

export async function updateMfaProfile({ pwd, params }) {
  const {
    id: loginId,
    secret: loginSecret,
    sessionToken,
    region,
    mfa,
    accountAlias,
  } = await fetchMfaCredentials({ pwd, params });
  log.info(`Writing credentials to AWS MFA profile ...`);
  const { HOME } = process.env;
  const awsFolderPath = join(HOME, '.aws');
  const awsFolderStats = await getFileStats(awsFolderPath);
  if (!awsFolderStats.exists) {
    await createFolder(awsFolderPath);
  } else if (!awsFolderStats.isDirectory) {
    throw new EnvironmentError(1681378970, `Entity in path "${awsFolderPath}" is not a folder`);
  }
  const credentialsFilePath = join(awsFolderPath, 'credentials');
  const credentialsFileStats = await getFileStats(credentialsFilePath);
  if (!credentialsFileStats.exists) {
    if (!(await hasWriteAccess(awsFolderPath))) {
      throw new EnvironmentError(1681379371, `No write access to folder "${awsFolderPath}"`);
    }
    await writeFile(credentialsFilePath, '', { mode: 0o600 });
  } else {
    if (!credentialsFileStats.isFile) {
      throw new EnvironmentError(
        1681380062,
        `Entity in path "${credentialsFilePath}" is not a file`
      );
    }
    if (!(await hasWriteAccess(credentialsFilePath))) {
      throw new EnvironmentError(1681380116, `No write access to file "${credentialsFilePath}"`);
    }
  }
  const mfaProfile =
    `${MFA_PROFILE_NEEDLE}\n` +
    `aws_access_key_id = ${loginId}\n` +
    `aws_secret_access_key = ${loginSecret}\n` +
    `aws_session_token = ${sessionToken}\n` +
    `mfa_serial = ${mfa}\n` +
    `region = ${region}\n\n`;
  const content = (await readFile(credentialsFilePath)).trim();
  let newContent;
  if (!content) {
    newContent = mfaProfile;
  } else {
    const sections = content.split(MFA_PROFILE_NEEDLE);
    if (sections.length < 2) {
      newContent = `${content}\n\n${mfaProfile}`;
    } else {
      if (sections.length > 2) {
        throw new EnvironmentError(
          1681382899,
          `Found multiple ${MFA_PROFILE_NEEDLE} headers in credentials file.`
        );
      }
      const [firstPart, mfaPart] = sections;
      const [, ...rest] = mfaPart.trim().split('[');
      newContent = `${firstPart.trim()}\n\n${mfaProfile}${rest.join('[')}\n\n`;
    }
  }
  await writeFile(credentialsFilePath, `${newContent.trim()}\n`, { mode: 0o600 });
  log.info(`Set profile in AWS credentials file for account "${accountAlias}":\n${mfaProfile}`);
}
