/* global __basedir */

const chalk = require('chalk');
const nunjucks = require('nunjucks');
const fs = require('fs');
const path = require('path');
const md = require('markdown-it')();

// Set up the chalk warning and error state
const warning = chalk.black.bgYellow;
const error = chalk.black.bgRed;

// Set up custom nunjucks environment and add custom parts
const nunjucksEnv = new nunjucks.Environment(
  new nunjucks.FileSystemLoader(path.join(__basedir, 'src', '_includes'))
);

class CodeSample {
  constructor(samplePath, permalinkPrefix = '', previewPrefix = '') {
    // The folder path from base where the code samples live
    this.samplePath = samplePath;

    // Remove trailing slash from the permalink/preview prefix
    this.permalinkPrefix = permalinkPrefix.replace(/\/$/, '');
    this.previewPrefix = previewPrefix.replace(/\/$/, '');

    // For storing processed items for speedier builds
    this.processedItems = [];
  }

  // Grabs all codeSamples that it can find at the root level then builds up a dataset,
  // rendered markup, view markup and docs. Lastly, it finds any variants and makes
  // those part of the codeSample, too
  get items() {
    // @ts-ignore

    // If the items have already been processed, it's an immediate return
    if (this.processedItems.length) {
      return this.processedItems;
    }

    const basePath = path.join(__basedir, 'src', this.samplePath);

    // Windows uses back slashes which breaks everything
    let characterSplit = basePath.includes('\\') ? '\\' : '/';

    // Gets codeSample paths, excluding hidden files/folders and files
    const getCodeSamplePaths = refPath => {
      return fs
        .readdirSync(refPath)
        .filter(item => !/(^|\/)\.[^/.]/g.test(item)) // Hidden
        .filter(item => !/[^\\]*\.(\w+)$/.test(item)); // detect file
    };

    // Parses out the codeSample name from the last segment in its path
    const getCodeSampleName = codeSamplePath => {
      const pathParts = codeSamplePath.split(characterSplit).filter(x => x.length);
      return pathParts[pathParts.length - 1];
    };

    const codeSamples = getCodeSamplePaths(basePath);

    // For creating a result collection
    const result = [];

    // This is used for both codeSamples and variants to grab markup, data and docs
    const buildCodeSample = (
      codeSamplePath,
      codeSampleName,
      parentPath = null,
      parentName = null,
      contextData = null
    ) => {
      const response = {};

      // Attempt to load markup from the pass codeSamplePath and codeSampleName first,
      // but if that can’t be found, attempt to load from the parent instead, if
      // its details have been passed in
      if (fs.existsSync(path.resolve(codeSamplePath, `${codeSampleName}.njk`))) {
        response.markup = fs.readFileSync(
          path.resolve(codeSamplePath, `${codeSampleName}.njk`),
          'utf8'
        );
      } else {
        if (parentPath !== null && parentName !== null) {
          if (fs.existsSync(path.resolve(parentPath, `${parentName}.njk`))) {
            response.markup = fs.readFileSync(
              path.resolve(parentPath, `${parentName}.njk`),
              'utf8'
            );
          }
        }
      }

      // All markup avenues exhausted so time to bail out
      if (!response.markup.length) {
        console.log(
          warning(
            `Markup file, ${codeSampleName}.njk wasn’t found, so this codeSample (${codeSamplePath}) can’t be built up`
          )
        );
        return null;
      }

      // If specific context data has been passed, we prioritise that
      if (contextData) {
        response.data = contextData.context ? contextData : {context: contextData};
      }
      // If not, we look for a data file
      else if (fs.existsSync(path.resolve(codeSamplePath, `${codeSampleName}.json`))) {
        response.data = buildCodeSampleData(
          fs.readFileSync(path.resolve(codeSamplePath, `${codeSampleName}.json`), 'utf8'),
          path.resolve(codeSamplePath, `${codeSampleName}.json`)
        );
      }

      // Render the pattern with nunjucks and tidy it up a bit with regex
      response.rendered = nunjucksEnv
        .renderString(response.markup, {
          data: response.data.context || {}
        })
        .replace(/^\s*\n/gm, ''); // Gets rid of blank lines (https://stackoverflow.com/q/16369642)

      // Renders out the docs if there's a markdown file
      if (fs.existsSync(path.resolve(codeSamplePath, `${codeSampleName}.md`))) {
        md.disable('code');
        response.docs = md.render(
          fs.readFileSync(path.resolve(codeSamplePath, `${codeSampleName}.md`), 'utf8')
        );
      }

      return response;
    };

    // Take data input and attempt to parse as JSON
    const buildCodeSampleData = (input, filePath) => {
      try {
        return JSON.parse(input);
      } catch (ex) {
        console.log(
          error(`CodeSample data was malformed and couldn’t be parsed (${filePath})`)
        );
        return {};
      }
    };

    // Loop each codeSamples folder, attempt to grab all the things and return
    // back a fully formed object to use
    codeSamples.forEach(item => {
      const codeSampleRoot = path.resolve(basePath, item);
      const codeSampleName = getCodeSampleName(codeSampleRoot);
      const codeSampleResponse = buildCodeSample(codeSampleRoot, codeSampleName);
      const codeSampleVariantsRoot = path.resolve(codeSampleRoot, 'variants');
      const codeSampleVariantsData = codeSampleResponse.data.variants || [];

      // Error will have been logged in buildCodeSample, but this is
      // not an acceptable response.
      if (!codeSampleResponse) {
        return;
      }

      // Urls for codeSample page and preview
      codeSampleResponse.url = `${this.permalinkPrefix}/${codeSampleName}/`;
      codeSampleResponse.previewUrl = `${this.previewPrefix}/${codeSampleName}/`;
      codeSampleResponse.name = codeSampleName;
      codeSampleResponse.renderPatternSnippet = `{{ design.patterns.renderPattern('${codeSampleName}', {}) | safe }}`;

      // An empty container for variants for if one or the other methods of loading
      // them results in nothing
      codeSampleResponse.variants = [];

      // If this codeSample has a variants folder
      // run the whole process on all that can be found
      if (fs.existsSync(codeSampleVariantsRoot)) {
        const variants = getCodeSamplePaths(codeSampleVariantsRoot);

        codeSampleResponse.variants = variants.map(variant => {
          const variantRoot = path.resolve(codeSampleVariantsRoot, variant);
          const variantName = getCodeSampleName(variantRoot);

          return {
            ...{
              name: variantName,
              previewUrl: `${this.previewPrefix}/${codeSampleName}/${variantName}/`,
              renderPatternSnippet: `{{ design.patterns.renderPattern('${codeSampleName}/${variantName}', {}) | safe }}`
            },
            ...buildCodeSample(variantRoot, variantName, codeSampleRoot, codeSampleName)
          };
        });
      }

      // If variants are defined in the root codeSample's config,
      // we need to render them too, using the root codeSample's markup
      if (codeSampleVariantsData.length) {
        const dataVariantItems = [];

        codeSampleVariantsData.forEach(variant => {
          dataVariantItems.push({
            ...{
              name: variant.name,
              previewUrl: `${this.previewPrefix}/${codeSampleName}/${variant.name}/`,
              renderPatternSnippet: `{{ design.patterns.renderPattern('${codeSampleName}/${variant.name}', {}) | safe }}`
            },
            ...buildCodeSample(codeSampleRoot, codeSampleName, null, null, {
              title: variant.title || variant.name,
              context: {
                ...codeSampleResponse.data.context,
                ...variant.context
              } // Merge existing context with variant context so we don't have to repeat ourselves a lot
            })
          });
        });

        // Now with the data variants built, we need to loop,
        // check that a file-based one wasn't already made,
        // then add it to the collection
        dataVariantItems.forEach(variantItem => {
          const existingCodeSample = codeSampleResponse.variants.find(
            x => x.name === variantItem.name
          );

          // Variant data files take priority, so if a rendered codeSample exists, bail on this iteration
          if (existingCodeSample) {
            console.log(
              warning(
                `The variant, ${variantItem.name} was already processed with a data file, which takes priority over variants defined in the root codeSample’ (${codeSampleName}) data file`
              )
            );
            return;
          }

          codeSampleResponse.variants.push(variantItem);
        });
      }

      // Lastly, sort variants by name if codeSample hasn't
      // specifically defined source order sorting
      if (codeSampleResponse.data.sort !== 'source') {
        if (codeSampleResponse.variants) {
          codeSampleResponse.variants = codeSampleResponse.variants.sort((a, b) =>
            a.name.localeCompare(b.name)
          );
        }
      }

      result.push(codeSampleResponse);
    });

    this.processedItems = result;
    return result;
  }

  // Returns a flat array of all codeSamples and variants
  get previews() {
    const response = [];

    this.items.forEach(item => {
      // Slice only what's needed from root codeSample
      response.push({
        previewUrl: item.previewUrl,
        data: {
          title: item.data.title,
          extraSampleCSS: item.data.extraSampleCSS
        },
        name: item.name,
        rendered: item.rendered
      });

      if (item.variants) {
        item.variants.forEach(variant => {
          response.push({
            ...variant,
            ...{
              name: variant.name,
              data: {
                extraSampleCSS: variant.data.extraSampleCSS ?? item.data.extraSampleCSS
              }
            }
          });
        });
      }
    });

    return response;
  }

  // Take the passed path and data to render a pattern from the design system
  renderPattern(path, data = {}) {
    const isVariant = path.indexOf('/') > -1;

    // If there's a slash in the path, take the first part to find the primary variant.
    // Otherwise, just use the path to find it
    let primaryPatternPath = isVariant ? path.split('/')[0] : path;

    // Try to find the pattern in our collection
    let primaryPattern = this.items.find(x => x.name === primaryPatternPath);

    // Pattern is what gets rendered, so set it as the primary pattern at first
    let pattern = primaryPattern;

    // If it's a variant we need to find that one
    if (isVariant) {
      pattern = primaryPattern.variants.find(x => x.name === path.split('/')[1]);
    }

    // At this point we can error out if no pattern is found
    if (!pattern) {
      return `<strong class="text-primary">Pattern ${path} not found</strong>`;
    }

    // Merge passed data with already processed data
    const patternData = {...pattern.data.context, ...data};

    return nunjucksEnv.renderString(pattern.markup, {
      data: patternData
    });
  }
}

module.exports = CodeSample;
