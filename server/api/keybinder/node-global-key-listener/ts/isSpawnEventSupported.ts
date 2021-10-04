/**
 * Checks whether the spawn event of a process is supported (requires node version 15.1+)
 * @returns Whether spawn is supported
 */
export function isSpawnEventSupported(): boolean {
	const nodeVersion = process.versions.node;
	const nums = nodeVersion.match(/(\d+)\.(\d+)\.(\d+)/);
	if (!nums) return false;

	const major = Number(nums[1]);
	const minor = Number(nums[2]);
	const spawnEventSupported = major > 15 || (major == 15 && minor >= 1);
	return spawnEventSupported;
}
