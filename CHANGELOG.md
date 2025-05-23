# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

### Added

- Meetings feature with list view and detailed meeting information pages
- Interface for users to view all meeting requests in a centralized dashboard
- Detail view to display meeting status, participants, and location information
- UI for showing suggested and selected meeting places
- Comprehensive unit and integration tests for the meetings feature
- Backend geocoding API endpoint at `/api/v1/geocoding` to securely handle address-to-coordinates conversion
- Updated frontend geocoding utility to use the backend endpoint instead of directly calling Google Maps API
- Fallback geocoding option when backend service is unavailable
- Improved error handling for geocoding operations throughout the application
- Automatic address geocoding in the backend when coordinates aren't provided with meeting requests

### Changed

- Modified meeting request API to use the new geocoding utility for address validation
- Updated CreateRequestForm component to provide better feedback during geocoding

## 0.1.0

### Commits

- Add test setup and basic tests [`2b64ddd`](https://github.com/groots/meeting-spot-frontend/commit/2b64ddd48f530f89c8e4a6600c994631042aaa44)
- Initial commit from Create Next App [`5e1553f`](https://github.com/groots/meeting-spot-frontend/commit/5e1553f2a1b0af1e7b76d441af1423d1a797b42b)
- Frontend stable with a bunch of css updates [`7b3cf39`](https://github.com/groots/meeting-spot-frontend/commit/7b3cf39776a31c3d203fa1ec38bf2e1d2adc4cc3)
- Update API configuration for production [`496147d`](https://github.com/groots/meeting-spot-frontend/commit/496147d96a09e393ea386c7e92c57a90b8fbd57f)
- added a lot of code/styles to create payment and contacts features [`da52ded`](https://github.com/groots/meeting-spot-frontend/commit/da52ded05b76da327b56132074e8138ecd6bb6f9)
- hopefully gettign the ui to progress between screens [`707f01c`](https://github.com/groots/meeting-spot-frontend/commit/707f01c48e1589d8f749ee6db2e6c56638f55e85)
- A LOT OF FIXES [`9fa1ce4`](https://github.com/groots/meeting-spot-frontend/commit/9fa1ce4480bc05bc208073dac76a28609e57c992)
- ### Fixeded some tests and add component library [`4c7dcdd`](https://github.com/groots/meeting-spot-frontend/commit/4c7dcdd405f52c35cb587b85cf59dbf1b6d8eab1)
- Add auth components and update config [`4d7834b`](https://github.com/groots/meeting-spot-frontend/commit/4d7834b8013fb2ce7f4ce8b4cc95190ce89c0a28)
- Update Next.js and fix Husky configuration [`8059313`](https://github.com/groots/meeting-spot-frontend/commit/8059313f77a099bfa1a6e377ed5f40dde521b8eb)
- a lot of changes but email should work and login [`b780669`](https://github.com/groots/meeting-spot-frontend/commit/b7806695df9fca232f9c801f190dcf82180e7579)
- ### Fixed: restore missing UI dependencies [`f770faf`](https://github.com/groots/meeting-spot-frontend/commit/f770faf339d70dacdf0ec7959051cd8011660bb5)
- Add core meeting spot workflow documentation and test script [`4d35fa9`](https://github.com/groots/meeting-spot-frontend/commit/4d35fa97b8ad6cf48aa63674c22ab44ccc236aaa)
- Fix e2e tests to be more resilient to failures [`414e1b8`](https://github.com/groots/meeting-spot-frontend/commit/414e1b8a447e9d8b7c64edc2dffed72ed4e46023)
- stable version deployed [`d6c42a9`](https://github.com/groots/meeting-spot-frontend/commit/d6c42a918426027f4210e64468c2ecff98c56854)
- Fix TypeScript errors in password reset pages [`7af9979`](https://github.com/groots/meeting-spot-frontend/commit/7af9979117d2afeed9515b6537b347f9cb19bb3e)
- Update to website copy and design [`d39eb44`](https://github.com/groots/meeting-spot-frontend/commit/d39eb447518f2684d4adecc39a6a9052369af752)
- Implement UI/UX improvements - authentication wrapper and multi-step form [`2fea75b`](https://github.com/groots/meeting-spot-frontend/commit/2fea75bf4bb15902266965985f1c92ae7e4ddb87)
- Fix API URL construction bug causing domain duplication in db-check endpoint [`fef4dd5`](https://github.com/groots/meeting-spot-frontend/commit/fef4dd5c652766367054d5b5394be4f643357dd2)
- adding footer and supporting service links to it [`ed5dd49`](https://github.com/groots/meeting-spot-frontend/commit/ed5dd49ba1fd4b35bea98a1c056a4db67b270afb)
- add tests and place categories [`f75257e`](https://github.com/groots/meeting-spot-frontend/commit/f75257e47b5a2d7beecba4598f46b888b5c75efd)
- ### Fixeding tests [`33cc40b`](https://github.com/groots/meeting-spot-frontend/commit/33cc40ba6ed45cb1e91807b71295bc18ce310b1a)
- Add comprehensive critical path E2E tests to ensure core flows never break in production [`e55e096`](https://github.com/groots/meeting-spot-frontend/commit/e55e096292b53607d3e56bff3aece59d816b99e9)
- adding social logins and delete user update [`3ffd312`](https://github.com/groots/meeting-spot-frontend/commit/3ffd31204a514af152d7f1428d72c7b68429a9ae)
- ### Added: added geocoding utility for address to coordinates conversion [`0b83d27`](https://github.com/groots/meeting-spot-frontend/commit/0b83d279e1293933e7803b3e9f22c75ca9e0d6b8)
- adding password reset [`2fefaa9`](https://github.com/groots/meeting-spot-frontend/commit/2fefaa96cc82bd62b2939bed744c0052d5338422)
- Initial commit: Frontend service with Next.js [`34df7a7`](https://github.com/groots/meeting-spot-frontend/commit/34df7a72602363ba187f837186790e71ec5e320c)
- Add comprehensive e2e tests for authentication flows [`118fb30`](https://github.com/groots/meeting-spot-frontend/commit/118fb30b1244b8eb72b5f4f65a83064ea26da782)
- Refactor: Implement polling cap and manual refresh on waiting page [`d8cad0c`](https://github.com/groots/meeting-spot-frontend/commit/d8cad0ce235cdec8e85c4fc8a0ac1b51ecb1c9ef)
- Improve e2e tests for authentication with more robust error handling [`58bb9d9`](https://github.com/groots/meeting-spot-frontend/commit/58bb9d93c9ea275bc4dc491e3b6bb8717bfe3027)
- added deletion link [`1062c40`](https://github.com/groots/meeting-spot-frontend/commit/1062c408e82f69489e45a3ca9458d4b77e1daa24)
- adding feature to use my location [`610d840`](https://github.com/groots/meeting-spot-frontend/commit/610d840667b2d33ec8c472e9ecad71a08bdaf8f4)
- ### Fixeding precommit error [`71584f5`](https://github.com/groots/meeting-spot-frontend/commit/71584f5808e897b7b69cf6974766244d0e8bbd91)
- adding auto changelog [`3ea3edb`](https://github.com/groots/meeting-spot-frontend/commit/3ea3edb1cd9d62cf41012a1f3f75182b33a1034f)
- Implement Phase 1 auth improvements - enhanced logging and better loading UI [`8e04928`](https://github.com/groots/meeting-spot-frontend/commit/8e049287675a7c595eecf540e187f860353dd869)
- adding e2e tests [`b7fb254`](https://github.com/groots/meeting-spot-frontend/commit/b7fb2540606a848cec02caa7d12421c09cf555e0)
- Consolidate GitHub Actions workflows into a single unified workflow [`e673592`](https://github.com/groots/meeting-spot-frontend/commit/e673592bc565893b93128711c3d5474ade28d16e)
- Add comprehensive documentation for critical path E2E tests [`35faa6a`](https://github.com/groots/meeting-spot-frontend/commit/35faa6a577421ce53185c415e83839cb1d4ec319)
- Fix Cloud Run deployment issues [`87a3069`](https://github.com/groots/meeting-spot-frontend/commit/87a3069ec15221dcb26aba4f9908216dbc600231)
- adding a debug login page [`ae7020a`](https://github.com/groots/meeting-spot-frontend/commit/ae7020a6305391422c7e8ccc8309a2685a5d3a3f)
- ### Fixed: correct API URL configuration and add tests [`921f0b2`](https://github.com/groots/meeting-spot-frontend/commit/921f0b29884bc516323b5b9c62b94298b289a4c6)
- Fix E2E tests to work reliably in CI environment [`ed641cd`](https://github.com/groots/meeting-spot-frontend/commit/ed641cdce34b943ed6dad24e9ec9216e892e1e9b)
- adding info to contact page [`9c63842`](https://github.com/groots/meeting-spot-frontend/commit/9c63842eee3b33d5beec263038f61171e6c9c1d7)
- Update system improvements doc to include Workflow Reliability section [`8c9a31d`](https://github.com/groots/meeting-spot-frontend/commit/8c9a31d1683ee9404f465363bbb11320d4b7ae51)
- Fix static file serving and add HTML test page [`115214d`](https://github.com/groots/meeting-spot-frontend/commit/115214d8b8a3cd6c898f1d12e716b13b8a2c31d8)
- Fix contacts API CORS issues with 308 redirects [`270b91c`](https://github.com/groots/meeting-spot-frontend/commit/270b91c7ea0ba62f182a231113c0703ef52156a6)
- Add debug page and build test script [`a387ec4`](https://github.com/groots/meeting-spot-frontend/commit/a387ec4aaa7a7573de7b6fb835926002214d6957)
- Convert auth-improvements to general system-improvements document with multiple categories [`c4a6ce6`](https://github.com/groots/meeting-spot-frontend/commit/c4a6ce6bca4c7345cdb7d699d8e3e4febd017257)
- ### Fixed: update static asset serving configuration [`6db4b8e`](https://github.com/groots/meeting-spot-frontend/commit/6db4b8ebecee8b3a0440dd4f2cba6696e7c12923)
- adding db check to debug page [`8f59931`](https://github.com/groots/meeting-spot-frontend/commit/8f59931529cc263b9efedbe051737d9e90ed1329)
- Switch to custom Express server for better static file serving [`22ebb21`](https://github.com/groots/meeting-spot-frontend/commit/22ebb21ee7d5de23292401e97cd0c128643ee027)
- Fix authentication state and redirection issues [`add5cb0`](https://github.com/groots/meeting-spot-frontend/commit/add5cb082f41f5bbb4b28723e8b886928023a11d)
- Add API test page [`5f8f2ce`](https://github.com/groots/meeting-spot-frontend/commit/5f8f2ce00d5511e34a29f7c2b610f4bfc8dd83cd)
- Add additional UI/UX improvement ideas to system improvements doc [`7e5c851`](https://github.com/groots/meeting-spot-frontend/commit/7e5c85128769efed6c36393cbbc7bfaeeb6b6edd)
- adding verbose logging trying to win deploying [`c5eb557`](https://github.com/groots/meeting-spot-frontend/commit/c5eb5572b9b18d89335624774179289e50b81f1f)
- Add frontend Cloud Run CD configuration [`315004b`](https://github.com/groots/meeting-spot-frontend/commit/315004b456bb88262f3ccbbb1e10b8ec2329fc8d)
- Add CI/CD workflow [`178de1a`](https://github.com/groots/meeting-spot-frontend/commit/178de1a24c7fda8b08b084133870edcce9e8c1c3)
- Update Next.js and fix Husky configuration [`528012d`](https://github.com/groots/meeting-spot-frontend/commit/528012d6b8582e515dabc340c84424c2faa3a8b2)
- ### Added: update frontend deployment for Cloud Run [`6a3e4ee`](https://github.com/groots/meeting-spot-frontend/commit/6a3e4ee1b2d4c116b054edf6001522399de0cd45)
- Temporarily simplify ContactStep to fix TypeScript errors [`9b962e9`](https://github.com/groots/meeting-spot-frontend/commit/9b962e9154eef360bb44b34f8ee8aabfe7933fe1)
- adding verbose logging trying to win deploying [`1969ebf`](https://github.com/groots/meeting-spot-frontend/commit/1969ebfba5aeaf491cecfa3ad94bd6e1aa118c56)
- ### Fixed nav and readable location [`1c64ab1`](https://github.com/groots/meeting-spot-frontend/commit/1c64ab1ff2d89e240970f95d9e0a0c17a4eb337f)
- Fix contacts API tests for CORS redirect handling [`8cdda76`](https://github.com/groots/meeting-spot-frontend/commit/8cdda767eecbcfed03c2d72fa7871e197a0dbf33)
- more deployment changes and more error loggin [`4e49423`](https://github.com/groots/meeting-spot-frontend/commit/4e49423d6eb5e258db6c124771a995ccec38d4cf)
- updating fb link [`7f51f7a`](https://github.com/groots/meeting-spot-frontend/commit/7f51f7a461c992e74fd6569f39a1dbc008111d2a)
- Temporarily skip failing contact API tests to unblock deployment [`7f3e9d5`](https://github.com/groots/meeting-spot-frontend/commit/7f3e9d5999dc37ae55e761c9a0703e123c112d4a)
- Fixed Dockerfile to properly use NEXT_PUBLIC_API_URL and updated API endpoint in cloudbuild.yaml [`290e9f2`](https://github.com/groots/meeting-spot-frontend/commit/290e9f255f5ede900c92914c95df6bb0946eb140)
- Split layout into server and client components [`07d7eb5`](https://github.com/groots/meeting-spot-frontend/commit/07d7eb58943ea71fe1e3689b4e65395cac265417)
- Fix CORS and API URL issues [`03ccf1f`](https://github.com/groots/meeting-spot-frontend/commit/03ccf1f1b8a53b9ed0065815cacb51582b61776a)
- Fix TypeScript errors in test-login component [`a5a4c2a`](https://github.com/groots/meeting-spot-frontend/commit/a5a4c2a8c9e7b5c3dac72ea1bc3b641b610bc1b4)
- ### Fixeding 308s hoping to fix deploy [`c2ff29e`](https://github.com/groots/meeting-spot-frontend/commit/c2ff29eb0be84bed238f50566ab99b3410a17e9c)
- ### Fixeding login ui error message [`1b64131`](https://github.com/groots/meeting-spot-frontend/commit/1b64131d056f3d9a07fd80a9e9f73e61cebb2e0a)
- ### Added: update frontend to use backend API URL [`6cf5eb7`](https://github.com/groots/meeting-spot-frontend/commit/6cf5eb7c48886a54a3ef68d8bd18b74cba83facb)
- ### Fixeding registration [`0889e73`](https://github.com/groots/meeting-spot-frontend/commit/0889e73ce85fd9edbc66ad726428b3519814c956)
- Update Next.js and fix Husky configuration [`f4d4bab`](https://github.com/groots/meeting-spot-frontend/commit/f4d4babd4b110ee34c38a23583eece5978c10b03)
- added a route catch all trying to stop 308s [`c8bab71`](https://github.com/groots/meeting-spot-frontend/commit/c8bab7105b3f69b6537517d598f7d8327c576b7b)
- Fix API endpoint trailing slashes and CORS configuration [`2f6823e`](https://github.com/groots/meeting-spot-frontend/commit/2f6823ec755db4e7bf0550fd64a88b8da2008f99)
- more deployment changes [`43eb8ae`](https://github.com/groots/meeting-spot-frontend/commit/43eb8aeb85154d32ad23a5ed719834b28a6efc87)
- ### Fixeding deploy [`d901c04`](https://github.com/groots/meeting-spot-frontend/commit/d901c04ce671154b53afa37f9b7dc34b409f78c3)
- ### Fixeding typescript errors [`5ec6b36`](https://github.com/groots/meeting-spot-frontend/commit/5ec6b368cc303c17a71ef606b542ac984d458619)
- Fix API endpoint URLs to include trailing slashes [`0fd94a1`](https://github.com/groots/meeting-spot-frontend/commit/0fd94a145fa059bbfcab6c01e711a059a0e3d757)
- ### Fixeding the request url [`42b3d40`](https://github.com/groots/meeting-spot-frontend/commit/42b3d406dfdca329bfb66813f7c54737414532ea)
- ### Fixeding contact error [`8c60823`](https://github.com/groots/meeting-spot-frontend/commit/8c60823afea640a865bc074eb24751b7757933f9)
- Update GitHub Actions to latest versions [`238f8f4`](https://github.com/groots/meeting-spot-frontend/commit/238f8f486141ecd4b7ff0d38efebeb3ef99f34c0)
- Fix TypeScript errors in e2e tests [`7edaf2c`](https://github.com/groots/meeting-spot-frontend/commit/7edaf2cac994b2fe5a99e249e79218bf45adf501)
- handling manual scaling and 308 redirects [`471ff76`](https://github.com/groots/meeting-spot-frontend/commit/471ff76bcfe844de366fae792a852111171a7188)
- handling manual scaling and 308 redirects [`597d351`](https://github.com/groots/meeting-spot-frontend/commit/597d3516408efee97c4ff82834f93be32c334af3)
- ### Documentation: update changelog with geocoding features [`3dcdb9c`](https://github.com/groots/meeting-spot-frontend/commit/3dcdb9c69fa585023bf80a3f2e6caf7008d2cdd0)
- Hard-code production API URL in config file [`fe545fb`](https://github.com/groots/meeting-spot-frontend/commit/fe545fbde2cc9ce4e34d23ac0d27240b57d7f415)
- Fix all contacts API tests [`5ff1cf6`](https://github.com/groots/meeting-spot-frontend/commit/5ff1cf61f8909ee1af5165868716823d43c546c8)
- adding spinner to contact selector [`059d337`](https://github.com/groots/meeting-spot-frontend/commit/059d337e5d54f8c00b8e6d5bc013921430efa49a)
- Fix login redirect issue by using hard redirect and adding debug logging [`ae246d7`](https://github.com/groots/meeting-spot-frontend/commit/ae246d77aa75bdd0263f71180b86ac67109a0a6d)
- updating login flow [`8fa203d`](https://github.com/groots/meeting-spot-frontend/commit/8fa203d3b4104763ef460646820c44a3f082bec1)
- updating docker to try and fix deploy issues [`81c225c`](https://github.com/groots/meeting-spot-frontend/commit/81c225c2b7338ab58f05c483527814e2e90f3df1)
- removing trailing slash [`77ea041`](https://github.com/groots/meeting-spot-frontend/commit/77ea0415ed1a2a35cc686350a871f53329e1371e)
- Fix Husky configuration for CI environment [`e24c3ac`](https://github.com/groots/meeting-spot-frontend/commit/e24c3ac42f501d6f5656b3348f80dcce64696386)
- more deployment changes [`6110cf0`](https://github.com/groots/meeting-spot-frontend/commit/6110cf0997fc84ab59081abb625ff4917c0a7194)
- Exclude e2e tests from Jest [`295a8ff`](https://github.com/groots/meeting-spot-frontend/commit/295a8ff061bcad88bb8f003785240535d6158605)
- ### Fixeding env vars for docker [`07ca6e2`](https://github.com/groots/meeting-spot-frontend/commit/07ca6e2b5d2756a0a9cab2f5b33e8c6bd49c3c33)
- working on social login [`2da427f`](https://github.com/groots/meeting-spot-frontend/commit/2da427f261f92b33aa14d44bc3ea4d798c1e94bd)
- more changes trying to fix deploy [`177c959`](https://github.com/groots/meeting-spot-frontend/commit/177c959a3d1bccba02cea68eebabb47f94ca18bc)
- Add globals.css [`832070b`](https://github.com/groots/meeting-spot-frontend/commit/832070b2ec9b0d7780daebb7ab9706b31745e6a4)
- handling manual scaling and 308 redirects [`f02f37f`](https://github.com/groots/meeting-spot-frontend/commit/f02f37f100dc0d5e0190772f2d01bf340f98d7bd)
- target right sign in button [`a2dead9`](https://github.com/groots/meeting-spot-frontend/commit/a2dead9230ca629f8d5ad7f598fdc860cf6af6bc)
- Improve error message for expired sessions [`2f6351e`](https://github.com/groots/meeting-spot-frontend/commit/2f6351e206bf038b510343de4a8a9bf8655c519c)
- Update API URL to use api.findameetingspot.com [`2ba05eb`](https://github.com/groots/meeting-spot-frontend/commit/2ba05eb2f2e0c38eb65a283f6cb2b044421195fb)
- Updated API test to use port 8081 [`47d0c65`](https://github.com/groots/meeting-spot-frontend/commit/47d0c6574e444f17b87688ca86dabff1233f54ac)
- ### Fixed: update API test to use correct backend port [`5a03127`](https://github.com/groots/meeting-spot-frontend/commit/5a0312738ab9de4c70dc822b31f5a00999ab1711)
- Remove use client directive from layout [`61d8c75`](https://github.com/groots/meeting-spot-frontend/commit/61d8c75297e8e55680ac7cdb6837605553e45bd2)
- Fix layout.tsx metadata export [`251b28c`](https://github.com/groots/meeting-spot-frontend/commit/251b28c4dcb42e916123e0c98c288f068178fe51)
- Fix: Add missing dependency to useCallback in WaitingPage [`40be954`](https://github.com/groots/meeting-spot-frontend/commit/40be9547e0c27150258572405cc69dd7da21f9b5)
- Update backend URL in Cloud Build config [`8765818`](https://github.com/groots/meeting-spot-frontend/commit/8765818a3986e22695d9de8704cfb8b6702452fa)
- Update API URL to point to new Cloud Run backend [`730a9be`](https://github.com/groots/meeting-spot-frontend/commit/730a9be6d8933ce32b7eb23b909a95e1ec05dd4a)
- removing var [`0f38c1d`](https://github.com/groots/meeting-spot-frontend/commit/0f38c1d0f6571af5185447788a3362ca5117fa92)
- Update Next.js and fix Husky configuration [`4e3ea1a`](https://github.com/groots/meeting-spot-frontend/commit/4e3ea1adada1e8513373be8aae1715790c7539be)
