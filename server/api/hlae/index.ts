import { mirvPgl } from './../../socket';
import { generateAfxLutFile } from '../../hlae/integration/xray';
import path from 'path';
import { app } from 'electron';

const afxLutFile = path.join(app.getPath('userData'), 'xray.afxlut');

const commands = `mirv_streams actions add glowColorMap blastGlow

mirv_streams actions edit blastGlow load "${afxLutFile}"
mirv_streams actions edit blastGlow normalize 1

mirv_streams add baseFx blast
mirv_streams edit blast forceBuildingCubeMaps 0
mirv_streams edit blast doBloomAndToneMapping 1
mirv_streams edit blast doDepthOfField 1
mirv_streams edit blast actionFilter clear
mirv_streams edit blast actionFilter add "__utilwireframe" blastGlow
mirv_streams edit blast actionFilter add "__utilwireframeignorez" blastGlow
mirv_streams edit blast actionFilter add "__utilvertexcolor" blastGlow
mirv_streams edit blast actionFilter add "__utilvertexcolorignorez" blastGlow
mirv_streams edit blast actionFilter add "dev/glow_color" blastGlow
mirv_streams preview blast

mirv_fix selectedPlayerGlow 0

glow_outline_width 6`.split('\n').filter(Boolean);

export const setXrayColors = (ctXray: number[], tXray: number[]) => {
	generateAfxLutFile(afxLutFile, ctXray, tXray);

	commands.forEach(command => {
		mirvPgl.execute(command);
	});
}