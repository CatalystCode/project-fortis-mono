# Admin Settings

Project Fortis comes with an admin page with which you can edit site configurations and also provide details on how events should be monitored and processed. Through the admin site, you will be able to configure site settings, blacklist terms, whitelist terms (watchlist), streams (twitter, facebook, etc.), monitored places, and trusted sources.

Once you deployed a site with `deploy to azure`, you may view the admin site by navigating to: http://localhost:8888/#/site/{YOUR_SITE_NAME}/admin

## Site Settings

Manage service tokens and set up how the site should be displayed.

| Value               | Description          |
| ------------------- | ------------- |
| Site Name           | Used as part of the admin url.  |
| Site Title          | Displayed on the navigation bar.|
| Bounding Box        | By default follows `Who's on First (WOF)`. The format of the WOF bounding box is: `maxY,minX,minY,maxX`. `Divipola` is also supported.                           |
| Header Logo Banner  | Image path of banner.  |
| Supported Languages | A comma delimited string with languages formatted as language codes like `en` or `ar`. The admin site can translate to any of the supported languages.
| Default Language    | The admin site will be displayed in this language. |
| Feature Service     | The feature service connection string formatted as `postgres://frontend:{your_password_here}@127.0.0.1/features`. More documentation on the feature service [here](https://github.com/CatalystCode/featureService).  |
| Translation Services Token | Needed for real-time text translation. Get a token [here](https://azure.microsoft.com/en-us/services/cognitive-services/translator-text-api).  |
| Cognitive Speech Services Token | Get a token [here](https://azure.microsoft.com/en-us/services/cognitive-services/custom-speech-service/).  |
| Cognitive Vision Services Token | Get a token [here](https://azure.microsoft.com/en-us/services/cognitive-services/custom-vision-service/)  |
| Cognitive Text Services Token | Used for sentiment analysis. Get a token [here](https://azure.microsoft.com/en-us/services/cognitive-services/text-analytics/)   |

## Watchlist

Manage keywords you would like to monitor. Keywords belong to different categories, which you will define in `watchlist` settings.

| Column Name         | Description   |
| ------------------- | ------------- |
| Category            | Categories are used to classify different keywords into logical groups. |
| name                | Keyword in the site's default language. |
| name_{language}     | Keyword translated to the site's supported language. |

### Adding Keywords with Excel then Translating them to a Supported Language

To add keywords quickly, you can copy keyword categories and keywords from `excel`, then paste them into the corresponding columns of the watchlist table. To get keyword translations in a supported languages, check the rows you would like translations for and then press the button `translate selection(s)`.

For example, in Excel you may have:

| Category            | Name          |
| ------------------- |:-------------:|
| armed conflict      | ammo          |
| armed conflict      | gun           |
| health              | medicine      |

## Monitored Places / Geofence

Specify coordinates and the zoom level of a location you would like to monitor.

| Value               | Description          |
| ------------------- | ------------- |
| Target Bbox         | Uses WOF. Provide a comma delimited string `maxY,minX,minY,maxX` |
| Zoom Level          | Specify as an `Integer`. |

## Event Import

Still needs to be implemented.

## Trusted Sources

Manage trusted sources like `twitter`, `facebook`, etc.

| Column Name         | Description   |
| ------------------- | ------------- |
| Pipeline Key        | Key associated with a pipeline. |
| External Source Id  | For `facebook`, this is the `facebook page id`. |
| Category            | Category monitored in the pipeline for a particular source type. Categories are originally defined in the `watchlist` tab.      |
| Name                | Friendly name for trusted source that you can specify as an alias to the external source id. |
| Source Type         | One of `Twitter`, `Facebook`, `Reddit`, etc. | 
| Rank                | An `Integer` value. Specifies the rank of a particular trusted source. |  

## Blacklisted Terms

Manage keywords to blacklist in the pipeline.

| Column Name         | Description   |
| ------------------- | ------------- |
| Id                  | Autopopulated `guid` of blacklisted term list. |
| Blacklisted Terms   | Enter a grouping of keywords for a blacklist as an array of strings `["Trump", "Obama", "election"]`. |

## Streams

| Column Name         | Description   |
| ------------------- | ------------- |
| Status              | Values are either `enabled` or `disabled`. If a stream is disabled, no events will be collected on that stream in the pipeline. |
| Pipeline Key        | Key associated with a pipeline. |
| Params              | Parameters used in different trusted sources like `twitter`, `facebook` etc. For example, for a `twitter` stream, parameters you might have would be `consumer key`, `consumer secret`, `access token key`, `access token secret`. These are formatted as key value pairs. |