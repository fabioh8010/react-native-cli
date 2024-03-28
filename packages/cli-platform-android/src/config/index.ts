/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import path from 'path';
import fs from 'fs';
import findAndroidDir from './findAndroidDir';
import findManifest from './findManifest';
import findPackageClassName from './findPackageClassName';
import {
  AndroidProjectParams,
  AndroidProjectConfig,
  AndroidDependencyParams,
  AndroidDependencyConfig,
} from '@react-native-community/cli-types';
import {
  getPackageName,
  parseApplicationIdFromBuildGradleFile,
} from './getAndroidProject';
import {findLibraryName} from './findLibraryName';
import {findComponentDescriptors} from './findComponentDescriptors';
import {findBuildGradle} from './findBuildGradle';
import {CLIError, logger} from '@react-native-community/cli-tools';
import getMainActivity from './getMainActivity';

/**
 * Gets android project config by analyzing given folder and taking some
 * defaults specified by user into consideration
 */
export function projectConfig(
  root: string,
  userConfig: AndroidProjectParams = {},
): AndroidProjectConfig | null {
  const src = userConfig.sourceDir || findAndroidDir(root);

  if (!src) {
    return null;
  }

  const sourceDir = path.join(root, src);

  const appName = getAppName(sourceDir, userConfig.appName);

  const manifestPath = userConfig.manifestPath
    ? path.join(sourceDir, userConfig.manifestPath)
    : findManifest(path.join(sourceDir, appName));
  const buildGradlePath = findBuildGradle(sourceDir, false);

  if (!manifestPath && !buildGradlePath) {
    return null;
  }

  const packageName =
    userConfig.packageName || getPackageName(manifestPath, buildGradlePath);

  if (!packageName) {
    throw new CLIError(
      `Package name not found in neither ${manifestPath} nor ${buildGradlePath}`,
    );
  }

  const applicationId = buildGradlePath
    ? getApplicationId(buildGradlePath, packageName)
    : packageName;
  const mainActivity = getMainActivity(manifestPath || '') ?? '';

  // @todo remove for RN 0.75
  if (userConfig.unstable_reactLegacyComponentNames) {
    logger.warn(
      'The "project.android.unstable_reactLegacyComponentNames" config option is not necessary anymore for React Native 0.74 and does nothing. Please remove it from the "react-native.config.js" file.',
    );
  }

  return {
    sourceDir,
    appName,
    packageName,
    applicationId,
    mainActivity,
    dependencyConfiguration: userConfig.dependencyConfiguration,
    watchModeCommandParams: userConfig.watchModeCommandParams,
    // @todo remove for RN 0.75
    unstable_reactLegacyComponentNames: undefined,
    assets: userConfig.assets ?? [],
  };
}

function getApplicationId(buildGradlePath: string, packageName: string) {
  let appId = packageName;

  const applicationId = parseApplicationIdFromBuildGradleFile(buildGradlePath);
  if (applicationId) {
    appId = applicationId;
  }
  return appId;
}

function getAppName(sourceDir: string, userConfigAppName: string | undefined) {
  let appName = '';
  if (
    typeof userConfigAppName === 'string' &&
    fs.existsSync(path.join(sourceDir, userConfigAppName))
  ) {
    appName = userConfigAppName;
  } else if (fs.existsSync(path.join(sourceDir, 'app'))) {
    appName = 'app';
  }
  return appName;
}

/**
 * Same as projectConfigAndroid except it returns
 * different config that applies to packages only
 */
export function dependencyConfig(
  root: string,
  userConfig: AndroidDependencyParams | null = {},
): AndroidDependencyConfig | null {
  if (userConfig === null) {
    return null;
  }

  const src = userConfig.sourceDir || findAndroidDir(root);

  if (!src) {
    return null;
  }

  const sourceDir = path.join(root, src);
  const manifestPath = userConfig.manifestPath
    ? path.join(sourceDir, userConfig.manifestPath)
    : findManifest(sourceDir);
  const buildGradlePath = findBuildGradle(sourceDir, true);

  if (!manifestPath && !buildGradlePath) {
    return null;
  }

  const packageName =
    userConfig.packageName || getPackageName(manifestPath, buildGradlePath);
  const packageClassName = findPackageClassName(sourceDir);

  /**
   * This module has no package to export
   */
  if (!packageClassName) {
    return null;
  }

  const packageImportPath =
    userConfig.packageImportPath ||
    `import ${packageName}.${packageClassName};`;

  const packageInstance =
    userConfig.packageInstance || `new ${packageClassName}()`;

  const buildTypes = userConfig.buildTypes || [];
  const dependencyConfiguration = userConfig.dependencyConfiguration;
  const libraryName =
    userConfig.libraryName || findLibraryName(root, sourceDir);
  const componentDescriptors =
    userConfig.componentDescriptors || findComponentDescriptors(root);
  let cmakeListsPath = userConfig.cmakeListsPath
    ? path.join(sourceDir, userConfig.cmakeListsPath)
    : path.join(sourceDir, 'build/generated/source/codegen/jni/CMakeLists.txt');
  const cxxModuleCMakeListsModuleName =
    userConfig.cxxModuleCMakeListsModuleName || null;
  const cxxModuleHeaderName = userConfig.cxxModuleHeaderName || null;
  let cxxModuleCMakeListsPath = userConfig.cxxModuleCMakeListsPath
    ? path.join(sourceDir, userConfig.cxxModuleCMakeListsPath)
    : null;

  if (process.platform === 'win32') {
    cmakeListsPath = cmakeListsPath.replace(/\\/g, '/');
    if (cxxModuleCMakeListsPath) {
      cxxModuleCMakeListsPath = cxxModuleCMakeListsPath.replace(/\\/g, '/');
    }
  }

  return {
    sourceDir,
    packageImportPath,
    packageInstance,
    buildTypes,
    dependencyConfiguration,
    libraryName,
    componentDescriptors,
    cmakeListsPath,
    cxxModuleCMakeListsModuleName,
    cxxModuleCMakeListsPath,
    cxxModuleHeaderName,
  };
}
