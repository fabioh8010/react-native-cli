import type {Config as CLIConfig} from '@react-native-community/cli-types';
import type FS from 'fs';
import type Path from 'path';
import snapshotDiff from 'snapshot-diff';
import {PartialDeep} from 'type-fest';
import xcode from 'xcode';
import {cleanup, getTempDirectory, writeFiles} from '../../../../jest/helpers';
import {
  baseProjectKotlin,
  baseProjectJava,
  fixtureFilePaths,
  fixtureFiles,
} from '../__fixtures__/projects';
import {linkAssets} from '../linkAssets';
import getGroup from '../tools/helpers/xcode/getGroup';
import '../xcode.d.ts';

const fs = jest.requireActual('fs') as typeof FS;
const path = jest.requireActual('path') as typeof Path;

const DIR = getTempDirectory('temp-project');

const readMainApplicationKotlinFile = () =>
  fs.readFileSync(
    path.resolve(DIR, fixtureFilePaths.mainApplicationKotlin),
    'utf8',
  );

const readMainApplicationJavaFile = () =>
  fs.readFileSync(
    path.resolve(DIR, fixtureFilePaths.mainApplicationJava),
    'utf8',
  );

const readAndroidLinkAssetsManifestFile = () =>
  fs.readFileSync(
    path.resolve(DIR, 'android/link-assets-manifest.json'),
    'utf8',
  );

const readInfoPlistFile = () =>
  fs.readFileSync(path.resolve(DIR, fixtureFilePaths.infoPlist), 'utf8');

const readIOSLinkAssetsManifestFile = () =>
  fs.readFileSync(path.resolve(DIR, 'ios/link-assets-manifest.json'), 'utf8');

const readLatoXMLFontFile = () =>
  fs.readFileSync(
    path.resolve(DIR, 'android/app/src/main/res/font/lato.xml'),
    'utf8',
  );

const readLatoBoldFontFile = () =>
  fs.readFileSync(
    path.resolve(DIR, 'android/app/src/main/res/font/lato_bold.ttf'),
    'utf8',
  );

const readLatoBoldItalicFontFile = () =>
  fs.readFileSync(
    path.resolve(DIR, 'android/app/src/main/res/font/lato_bolditalic.ttf'),
    'utf8',
  );

const readLatoRegularFontFile = () =>
  fs.readFileSync(
    path.resolve(DIR, 'android/app/src/main/res/font/lato_regular.ttf'),
    'utf8',
  );

const readLatoLightFontFile = () =>
  fs.readFileSync(
    path.resolve(DIR, 'android/app/src/main/res/font/lato_light.ttf'),
    'utf8',
  );

const readFiraCodeXMLFontFile = () =>
  fs.readFileSync(
    path.resolve(DIR, 'android/app/src/main/res/font/fira_code.xml'),
    'utf8',
  );

const readFiraCodeBoldFontFile = () =>
  fs.readFileSync(
    path.resolve(DIR, 'android/app/src/main/res/font/firacode_bold.otf'),
    'utf8',
  );

const readFiraCodeRegularFontFile = () =>
  fs.readFileSync(
    path.resolve(DIR, 'android/app/src/main/res/font/firacode_regular.otf'),
    'utf8',
  );

const readMontserratXMLFontFile = () =>
  fs.readFileSync(
    path.resolve(DIR, 'android/app/src/main/res/font/montserrat.xml'),
    'utf8',
  );

const readMontserratRegularFontFile = () =>
  fs.readFileSync(
    path.resolve(DIR, 'android/app/src/main/res/font/montserrat_regular.ttf'),
    'utf8',
  );

const readDocumentPdfFile = () =>
  fs.readFileSync(
    path.resolve(DIR, 'android/app/src/main/assets/custom/document.pdf'),
    'utf8',
  );

const readImageGifFile = () =>
  fs.readFileSync(
    path.resolve(DIR, 'android/app/src/main/res/drawable/image_gif.gif'),
    'utf8',
  );

const readImageJpgFile = () =>
  fs.readFileSync(
    path.resolve(DIR, 'android/app/src/main/res/drawable/image_jpg.jpg'),
    'utf8',
  );

const readImagePngFile = () =>
  fs.readFileSync(
    path.resolve(DIR, 'android/app/src/main/res/drawable/image_png.png'),
    'utf8',
  );

const readSoundMp3File = () =>
  fs.readFileSync(
    path.resolve(DIR, 'android/app/src/main/res/raw/sound.mp3'),
    'utf8',
  );

const getIOSProjectResourcesGroup = () => {
  const project = xcode
    .project(path.resolve(DIR, fixtureFilePaths.projectPbxproj))
    .parseSync();
  return getGroup(project, 'Resources');
};

const testBaseProjectStructure = (isKotlinProject = true) => {
  const baseProject = isKotlinProject ? baseProjectKotlin : baseProjectJava;
  const mainApplicationFilePath = isKotlinProject
    ? fixtureFilePaths.mainApplicationKotlin
    : fixtureFilePaths.mainApplicationJava;

  // Android
  expect(
    snapshotDiff(
      baseProject[mainApplicationFilePath].toString(),
      isKotlinProject
        ? readMainApplicationKotlinFile()
        : readMainApplicationJavaFile(),
    ),
  ).toMatchSnapshot();
  expect(
    snapshotDiff('', readAndroidLinkAssetsManifestFile()),
  ).toMatchSnapshot();

  expect(snapshotDiff('', readLatoXMLFontFile())).toMatchSnapshot();
  expect(baseProjectKotlin[fixtureFilePaths.latoBoldFont].toString()).toEqual(
    readLatoBoldFontFile(),
  );
  expect(
    baseProjectKotlin[fixtureFilePaths.latoBoldItalicFont].toString(),
  ).toEqual(readLatoBoldItalicFontFile());
  expect(
    baseProjectKotlin[fixtureFilePaths.latoRegularFont].toString(),
  ).toEqual(readLatoRegularFontFile());

  expect(snapshotDiff('', readFiraCodeXMLFontFile())).toMatchSnapshot();
  expect(
    baseProjectKotlin[fixtureFilePaths.firaCodeBoldFont].toString(),
  ).toEqual(readFiraCodeBoldFontFile());
  expect(
    baseProjectKotlin[fixtureFilePaths.firaCodeRegularFont].toString(),
  ).toEqual(readFiraCodeRegularFontFile());

  expect(baseProjectKotlin[fixtureFilePaths.documentPdf].toString()).toEqual(
    readDocumentPdfFile(),
  );
  expect(baseProjectKotlin[fixtureFilePaths.soundMp3].toString()).toEqual(
    readSoundMp3File(),
  );
  expect(baseProjectKotlin[fixtureFilePaths.imageGif].toString()).toEqual(
    readImageGifFile(),
  );
  expect(baseProjectKotlin[fixtureFilePaths.imageJpg].toString()).toEqual(
    readImageJpgFile(),
  );
  expect(baseProjectKotlin[fixtureFilePaths.imagePng].toString()).toEqual(
    readImagePngFile(),
  );

  // iOS
  expect(
    snapshotDiff(
      baseProjectKotlin[fixtureFilePaths.infoPlist].toString(),
      readInfoPlistFile(),
    ),
  ).toMatchSnapshot();
  expect(snapshotDiff('', readIOSLinkAssetsManifestFile())).toMatchSnapshot();

  const resourcesGroup = getIOSProjectResourcesGroup();
  expect(resourcesGroup?.children.length).toBe(9);
  [
    fixtureFilePaths.firaCodeBoldFont,
    fixtureFilePaths.firaCodeRegularFont,
    fixtureFilePaths.latoRegularFont,
    fixtureFilePaths.ralewayRegularFont,
    fixtureFilePaths.soundMp3,
    fixtureFilePaths.imageGif,
    fixtureFilePaths.imageJpg,
    fixtureFilePaths.imagePng,
    fixtureFilePaths.documentPdf,
  ]
    .map((filePath) => path.basename(filePath))
    .forEach((fileName) => {
      expect(
        resourcesGroup?.children.some((r) => r.comment === fileName),
      ).toBeTruthy();
    });
};

beforeEach(() => {
  cleanup(DIR);
  jest.resetModules();
  jest.clearAllMocks();
});

afterEach(() => cleanup(DIR));

describe('linkAssets', () => {
  const configMock: PartialDeep<CLIConfig> = {
    assets: ['./assets/shared'],
    project: {
      android: {
        sourceDir: `${DIR}/android`,
        appName: 'app',
        assets: ['./assets/android'],
      },
      ios: {
        sourceDir: `${DIR}/ios`,
        assets: ['./assets/ios'],
      },
    },
  };

  const linkAssetsOptions = {
    projectRoot: DIR,
  };

  it('should link all types of assets in a Kotlin project for the first time', async () => {
    writeFiles(DIR, baseProjectKotlin);

    await linkAssets([], configMock as CLIConfig, linkAssetsOptions);

    testBaseProjectStructure(true);
  });

  it('should link all types of assets in a Java project for the first time', async () => {
    writeFiles(DIR, baseProjectJava);

    await linkAssets([], configMock as CLIConfig, linkAssetsOptions);

    testBaseProjectStructure(false);
  });

  it('should link new assets in a project', async () => {
    writeFiles(DIR, baseProjectKotlin);

    await linkAssets([], configMock as CLIConfig, linkAssetsOptions);

    const oldAndroidLinkAssetsManifestFile =
      readAndroidLinkAssetsManifestFile();
    const oldMainApplicationFile = readMainApplicationKotlinFile();
    const oldLatoXMLFontFile = readLatoXMLFontFile();
    const oldIOSLinkAssetsManifestFile = readIOSLinkAssetsManifestFile();
    const oldInfoPlistFile = readInfoPlistFile();

    writeFiles(DIR, {
      [fixtureFilePaths.latoLightFont]: fixtureFiles.latoLightFont,
      [fixtureFilePaths.montserratRegularFont]:
        fixtureFiles.montserratRegularFont,
    });

    await linkAssets([], configMock as CLIConfig, linkAssetsOptions);

    // Android
    expect(
      snapshotDiff(
        oldAndroidLinkAssetsManifestFile,
        readAndroidLinkAssetsManifestFile(),
      ),
    ).toMatchSnapshot();
    expect(
      snapshotDiff(oldMainApplicationFile, readMainApplicationKotlinFile()),
    ).toMatchSnapshot();
    expect(
      snapshotDiff(oldLatoXMLFontFile, readLatoXMLFontFile()),
    ).toMatchSnapshot();
    expect(fixtureFiles.latoLightFont.toString()).toEqual(
      readLatoLightFontFile(),
    );
    expect(snapshotDiff('', readMontserratXMLFontFile())).toMatchSnapshot();
    expect(fixtureFiles.montserratRegularFont.toString()).toEqual(
      readMontserratRegularFontFile(),
    );

    // iOS
    expect(
      snapshotDiff(
        oldIOSLinkAssetsManifestFile,
        readIOSLinkAssetsManifestFile(),
      ),
    ).toMatchSnapshot();
    expect(
      snapshotDiff(oldInfoPlistFile, readInfoPlistFile()),
    ).toMatchSnapshot();

    const resourcesGroup = getIOSProjectResourcesGroup();
    expect(resourcesGroup?.children.length).toBe(10);
    [
      fixtureFilePaths.firaCodeBoldFont,
      fixtureFilePaths.firaCodeRegularFont,
      fixtureFilePaths.latoRegularFont,
      fixtureFilePaths.ralewayRegularFont,
      fixtureFilePaths.soundMp3,
      fixtureFilePaths.imageGif,
      fixtureFilePaths.imageJpg,
      fixtureFilePaths.imagePng,
      fixtureFilePaths.documentPdf,
      fixtureFilePaths.latoLightFont,
    ]
      .map((filePath) => path.basename(filePath))
      .forEach((fileName) => {
        expect(
          resourcesGroup?.children.some((r) => r.comment === fileName),
        ).toBeTruthy();
      });
  });

  it('should unlink deleted assets in a project', async () => {});

  it('should unlink all assets in a project', async () => {});

  it('should relink font assets from an Android project to use XML resources', async () => {});
});
