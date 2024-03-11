import {Command, DetachedCommand} from '@react-native-community/cli-types';
import {commands as cleanCommands} from '@react-native-community/cli-clean';
import {commands as doctorCommands} from '@react-native-community/cli-doctor';
import {commands as configCommands} from '@react-native-community/cli-config';
import {commands as linkAssetsCommands} from '@react-native-community/cli-link-assets';
import init from './init';

export const projectCommands = [
  ...configCommands,
  cleanCommands.clean,
  doctorCommands.info,
  linkAssetsCommands.linkAssets,
] as Command[];

export const detachedCommands = [
  init,
  doctorCommands.doctor,
] as DetachedCommand[];
