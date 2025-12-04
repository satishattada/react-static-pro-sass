import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import autoprefixer from 'autoprefixer'
import postcssFlexbugsFixes from 'postcss-flexbugs-fixes'

export default ({ includePaths = [], cssLoaderOptions = {}, ...rest }) => ({
  webpack: (config, { stage }) => {
    console.log('✅ SASS PLUGIN INITIALIZED - webpack config stage:', stage)
    
    let loaders = []

    const sassLoader = {
      loader: 'sass-loader',
      options: {
        sourceMap: stage === 'dev',
        sassOptions: {
          includePaths: ['src/', ...includePaths],
          ...rest,
        },
      },
    }

    const cssLoader = {
      loader: 'css-loader',
      options: {
        importLoaders: 2,
        sourceMap: stage === 'dev',
        modules: false,
        ...cssLoaderOptions,
      },
    }

    const postCssLoader = {
      loader: 'postcss-loader',
      options: {
        sourceMap: stage === 'dev',
        postcssOptions: {
          plugins: [
            postcssFlexbugsFixes,
            autoprefixer({
              flexbox: 'no-2009',
            }),
          ],
        },
      },
    }

    if (stage === 'dev') {
      // Development: use style-loader for HMR
      console.log('🔧 SASS PLUGIN: Dev mode - using style-loader for HMR')
      loaders = [
        'style-loader',
        cssLoader,
        postCssLoader,
        sassLoader,
      ]
    } else if (stage === 'node') {
      // Node/SSR: use css-loader/locals
      console.log('🔧 SASS PLUGIN: Node stage - using css-loader/locals for SSR')
      loaders = [
        {
          loader: 'css-loader/locals',
          options: cssLoader.options,
        },
        postCssLoader,
        sassLoader,
      ]
    } else {
      // Production: use MiniCssExtractPlugin for code splitting
      console.log('🔧 SASS PLUGIN: Production mode - extracting CSS with MiniCssExtractPlugin')
      loaders = [
        MiniCssExtractPlugin.loader,
        cssLoader,
        postCssLoader,
        sassLoader,
      ]
    }

    console.log('🔧 SASS PLUGIN: Adding SCSS rule to webpack config')
    
    // Handle both oneOf structure and flat rules array
    if (config.module.rules[0]?.oneOf) {
      console.log('📋 SASS PLUGIN: Found oneOf structure, adding rule to oneOf array')
      config.module.rules[0].oneOf.unshift({
        test: /\.s(a|c)ss$/,
        use: loaders,
      })
    } else {
      console.log('📋 SASS PLUGIN: No oneOf structure, adding rule to main rules array')
      config.module.rules.unshift({
        test: /\.s(a|c)ss$/,
        use: loaders,
      })
    }

    // Update splitChunks for CSS optimization
    if (config.optimization?.splitChunks?.cacheGroups?.styles) {
      console.log('🔧 SASS PLUGIN: Updating splitChunks cacheGroups for SCSS')
      config.optimization.splitChunks.cacheGroups.styles.test = /\.(c|sc|sa)ss$/
    }

    console.log('✅ SASS PLUGIN: SCSS loader rule added successfully')
    return config
  },
})
