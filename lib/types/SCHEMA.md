# GraphQL Schema – Struktur

> Automatisch generiert von `vite/graphql` (graphqlTypesPlugin) aus `generated/schema.graphql`.
> Nicht von Hand bearbeiten – die Datei wird bei jeder Schema-Änderung neu geschrieben.

**Legende:** `$arg` = Argument · `‹IName›` = generiertes TS-Interface · `!` = Pflichtfeld · `[T]` = Liste · `↻` = rekursiver Typ · `…` = Tiefe erreicht (`tree.depth` = 3)

| Bereich               | Anzahl |
| --------------------- | -----: |
| [Query](#query)       |    114 |
| [Mutation](#mutation) |    218 |
| Object-Types          |    387 |
| Interfaces            |      0 |
| Unions                |      0 |
| [Inputs](#inputs)     |     21 |
| Enums                 |      5 |
| Scalars               |     10 |

## Query

```text
Query  ‹IQuery›
├── accountSelfLoad: accountSelfLoad  ‹IAccountSelfLoad›
│   └── account: userAccount  ‹IUserAccount›
│       ├── age: Int
│       ├── alias: String!
│       ├── avatarUrl: String
│       ├── birthday: String
│       ├── description: userDescription  ‹IUserDescription›
│       │   └── html: String
│       ├── details: userDetails  ‹IUserDetails›
│       │   ├── firstname: String
│       │   └── lastname: String
│       ├── email: String!
│       ├── gender: String
│       ├── id: String!
│       ├── lastLogin: DateTime
│       ├── settings: userSettings  ‹IUserSettings›
│       │   ├── public: Boolean
│       │   ├── searchable: Boolean
│       │   ├── showEmail: Boolean
│       │   └── showFullName: Boolean
│       ├── superUser: Boolean
│       └── userType: String!
├── adminPageGet: adminPageGetReturn  ‹IAdminPageGetReturn›
│   ├── $id: ID!
│   ├── page: JSON
│   └── success: Boolean
├── adminPageList: adminPageListReturn  ‹IAdminPageListReturn›
│   ├── pages: JSON
│   └── success: Boolean
├── adminRoleList: adminRoleListReturn  ‹IAdminRoleListReturn›
│   ├── definitions: JSON
│   ├── groups: JSON
│   ├── roles: JSON
│   └── success: Boolean
├── adminSeoOverview: adminSeoOverviewReturn  ‹IAdminSeoOverviewReturn›
│   ├── error: String
│   ├── field: String
│   ├── routes: JSON
│   ├── settings: JSON
│   ├── sitemap: JSON
│   └── success: Boolean
├── adminStatsGrowth: adminStatsGrowthReturn  ‹IAdminStatsGrowthReturn›
│   ├── $range: Int
│   ├── error: String
│   ├── field: String
│   ├── growth: JSON
│   └── success: Boolean
├── adminStatsLive: adminStatsLiveReturn  ‹IAdminStatsLiveReturn›
│   ├── error: String
│   ├── field: String
│   ├── live: JSON
│   └── success: Boolean
├── adminStatsOverview: adminStatsOverviewReturn  ‹IAdminStatsOverviewReturn›
│   ├── $range: Int
│   ├── error: String
│   ├── field: String
│   ├── stats: JSON
│   └── success: Boolean
├── adminStatsSecurity: adminStatsSecurityReturn  ‹IAdminStatsSecurityReturn›
│   ├── $range: Int
│   ├── error: String
│   ├── field: String
│   ├── security: JSON
│   └── success: Boolean
├── adminStatsUser: adminStatsUserReturn  ‹IAdminStatsUserReturn›
│   ├── $userId: ID!
│   ├── activity: JSON
│   ├── error: String
│   ├── field: String
│   └── success: Boolean
├── adminStatsVisitors: adminStatsVisitorsReturn  ‹IAdminStatsVisitorsReturn›
│   ├── $filter: String
│   ├── $hideAdmins: Boolean
│   ├── $range: Int
│   ├── $term: String
│   ├── error: String
│   ├── field: String
│   ├── success: Boolean
│   ├── total: Int
│   └── visitors: JSON
├── adminSystemDeploys: adminSystemDeploysReturn  ‹IAdminSystemDeploysReturn›
│   ├── $limit: Int
│   ├── error: String
│   ├── field: String
│   ├── history: JSON
│   └── success: Boolean
├── adminSystemStorage: adminSystemStorageReturn  ‹IAdminSystemStorageReturn›
│   ├── $refresh: Boolean
│   ├── error: String
│   ├── field: String
│   ├── storage: JSON
│   └── success: Boolean
├── adminUserGet: adminUserGetReturn  ‹IAdminUserGetReturn›
│   ├── $userId: ID!
│   ├── success: Boolean
│   └── user: JSON
├── adminUserSearch: adminUserSearchReturn  ‹IAdminUserSearchReturn›
│   ├── $limit: Int
│   ├── $offset: Int
│   ├── $term: String
│   ├── success: Boolean
│   ├── total: Int
│   └── users: JSON
├── authAdminBanInfo: authAdminBanInfoReturn  ‹IAuthAdminBanInfoReturn›
│   ├── $userId: ID!
│   ├── ban: JSON
│   ├── error: String
│   ├── field: String
│   ├── retryAfter: Int
│   └── success: Boolean
├── authAliasCheck: authAliasCheckReturn  ‹IAuthAliasCheckReturn›
│   ├── $alias: String!
│   ├── available: Boolean
│   ├── error: String
│   ├── field: String
│   ├── retryAfter: Int
│   ├── success: Boolean
│   └── suggestions: JSON
├── authCheck: authCheck  ‹IAuthCheck›
│   └── authorized: Boolean
├── authIdentify: authIdentifyReturn  ‹IAuthIdentifyReturn›
│   ├── $identifier: String!
│   ├── email: String
│   ├── error: String
│   ├── exists: Boolean
│   ├── field: String
│   ├── methods: JSON
│   ├── retryAfter: Int
│   └── success: Boolean
├── authInvite: authInviteReturn  ‹IAuthInviteReturn›
│   ├── error: String
│   ├── expiresAt: String
│   ├── field: String
│   ├── retryAfter: Int
│   ├── success: Boolean
│   ├── token: String
│   └── uses: Int
├── authInviteInfo: authInviteInfoReturn  ‹IAuthInviteInfoReturn›
│   ├── $token: String!
│   ├── alias: String
│   ├── avatarUrl: String
│   ├── error: String
│   ├── field: String
│   ├── retryAfter: Int
│   └── success: Boolean
├── authSecurity: authSecurityReturn  ‹IAuthSecurityReturn›
│   ├── error: String
│   ├── field: String
│   ├── retryAfter: Int
│   ├── security: JSON
│   └── success: Boolean
├── authSessions: authSessionsReturn  ‹IAuthSessionsReturn›
│   ├── count: Int
│   ├── error: String
│   ├── field: String
│   ├── retryAfter: Int
│   ├── sessions: JSON
│   └── success: Boolean
├── clientReadData: clientReadDataReturn  ‹IClientReadDataReturn›
│   ├── $dataKey: String!
│   ├── data: JSON
│   └── success: Boolean
├── clientStatus: clientStatusReturn  ‹IClientStatusReturn›
│   ├── $deviceId: String!
│   ├── clientId: String
│   ├── internal: Boolean
│   ├── online: Boolean
│   ├── rejected: Boolean
│   ├── success: Boolean
│   └── userMeta: clientUserMata  ‹IClientUserMata›
│       ├── alias: String
│       ├── avatarUrl: String
│       └── id: String
├── clientWriteData: clientWriteDataReturn  ‹IClientWriteDataReturn›
│   ├── $data: JSON!
│   ├── $dataKey: String!
│   └── success: Boolean
├── cronJobList: cronJobListReturn  ‹ICronJobListReturn›
│   ├── list: JSON
│   └── success: Boolean
├── cronRunnerList: cronRunnerListReturn  ‹ICronRunnerListReturn›
│   ├── list: JSON
│   └── success: Boolean
├── currencyGet: currencyGetReturn  ‹ICurrencyGetReturn›
│   ├── $params: currencyParams!  ‹ICurrencyParams›
│   │   ├── amount: Float
│   │   ├── base: String!
│   │   └── symbols: String
│   ├── amount: String
│   ├── base: String
│   ├── date: DateTime
│   └── rates: JSON
├── DbResourceRead: dbResourceReadResult  ‹IDbResourceReadResult›
│   ├── $alias: String!
│   ├── $filters: JSON
│   ├── $order: JSON
│   ├── $pagination: dbPagination  ‹IDbPagination›
│   │   ├── limit: Int!
│   │   └── offset: Int!
│   ├── count: Int
│   ├── records: JSON
│   ├── requestId: String
│   ├── success: Boolean
│   └── total: Int
├── developerTestSource: developerTestSourceReturn  ‹IDeveloperTestSourceReturn›
│   ├── news: JSON
│   └── success: Boolean
├── forumCommunities: forumCommunitiesReturn  ‹IForumCommunitiesReturn›
│   ├── $options: JSON
│   ├── communities: JSON
│   ├── error: String
│   └── success: Boolean
├── forumCommunity: forumCommunityReturn  ‹IForumCommunityReturn›
│   ├── $slug: String!
│   ├── community: JSON
│   ├── error: String
│   └── success: Boolean
├── forumCommunityMembers: forumCommunityMembersReturn  ‹IForumCommunityMembersReturn›
│   ├── $slug: String!
│   ├── error: String
│   ├── members: JSON
│   └── success: Boolean
├── forumFeed: forumFeedReturn  ‹IForumFeedReturn›
│   ├── $options: JSON
│   ├── community: JSON
│   ├── error: String
│   ├── hasNextPage: Boolean
│   ├── page: Int
│   ├── posts: JSON
│   ├── scope: String
│   └── success: Boolean
├── forumPost: forumPostReturn  ‹IForumPostReturn›
│   ├── $postId: ID!
│   ├── comments: JSON
│   ├── community: JSON
│   ├── error: String
│   ├── post: JSON
│   └── success: Boolean
├── forumSearch: forumSearchReturn  ‹IForumSearchReturn›
│   ├── $options: JSON!
│   ├── error: String
│   ├── hasNextPage: Boolean
│   ├── page: Int
│   ├── posts: JSON
│   └── success: Boolean
├── getLocationByCoords: getLocationByCoords  ‹IGetLocationByCoords›
│   ├── $lat: String!
│   ├── $lon: String!
│   └── address: getLocationByCoordsAddress  ‹IGetLocationByCoordsAddress›
│       ├── city: String
│       ├── code: String
│       ├── country: String
│       ├── number: String
│       ├── postcode: String
│       ├── state: String
│       └── street: String
├── getLocationByIp: getLocationByIp  ‹IGetLocationByIp›
│   ├── $ip: String!
│   ├── city: String
│   ├── country: String
│   ├── country_code: String
│   ├── ip: String
│   ├── network: String
│   ├── region: String
│   ├── region_code: String
│   └── version: String
├── holidays: holidays  ‹IHolidays›
│   ├── $country: String!
│   ├── $year: Int!
│   └── items: [holidaysItems]  ‹IHolidaysItems›
│       ├── counties: JSON
│       ├── countryCode: String
│       ├── date: String
│       ├── localName: String
│       ├── name: String
│       └── types: JSON
├── kidsAccount: kidsAccountReturn  ‹IKidsAccountReturn›
│   ├── $kidUserId: ID
│   ├── account: JSON
│   ├── error: String
│   ├── field: String
│   └── success: Boolean
├── kidsComfortList: kidsComfortListReturn  ‹IKidsComfortListReturn›
│   ├── error: String
│   ├── field: String
│   ├── messages: JSON
│   └── success: Boolean
├── kidsConnectList: kidsConnectListReturn  ‹IKidsConnectListReturn›
│   ├── approvals: JSON
│   ├── error: String
│   ├── field: String
│   ├── incoming: JSON
│   ├── outgoing: JSON
│   └── success: Boolean
├── kidsExportData: kidsExportDataReturn  ‹IKidsExportDataReturn›
│   ├── $kidUserId: ID!
│   ├── data: JSON
│   ├── error: String
│   ├── field: String
│   └── success: Boolean
├── kidsKidLoad: kidsKidLoadReturn  ‹IKidsKidLoadReturn›
│   ├── $kidUserId: ID!
│   ├── error: String
│   ├── field: String
│   ├── kid: JSON
│   ├── links: JSON
│   └── success: Boolean
├── kidsLedger: kidsLedgerReturn  ‹IKidsLedgerReturn›
│   ├── $kidUserId: ID!
│   ├── $weekStart: String
│   ├── entries: JSON
│   ├── error: String
│   ├── field: String
│   ├── success: Boolean
│   └── week: JSON
├── kidsList: kidsListReturn  ‹IKidsListReturn›
│   ├── error: String
│   ├── field: String
│   ├── households: JSON
│   ├── invitations: JSON
│   ├── kids: JSON
│   └── success: Boolean
├── kidsOverview: kidsOverviewReturn  ‹IKidsOverviewReturn›
│   ├── due: JSON
│   ├── error: String
│   ├── field: String
│   ├── kids: JSON
│   └── success: Boolean
├── kidsPending: kidsPendingReturn  ‹IKidsPendingReturn›
│   ├── error: String
│   ├── field: String
│   ├── success: Boolean
│   └── tasks: JSON
├── kidsPracticeList: kidsPracticeListReturn  ‹IKidsPracticeListReturn›
│   ├── $kidUserId: ID
│   ├── canManage: Boolean
│   ├── error: String
│   ├── exams: JSON
│   ├── field: String
│   ├── practices: JSON
│   ├── savedId: String
│   ├── subjects: JSON
│   └── success: Boolean
├── kidsPracticeRun: kidsPracticeRunReturn  ‹IKidsPracticeRunReturn›
│   ├── $id: ID!
│   ├── error: String
│   ├── field: String
│   ├── run: JSON
│   └── success: Boolean
├── kidsRatingsForMe: kidsRatingsForMeReturn  ‹IKidsRatingsForMeReturn›
│   ├── error: String
│   ├── field: String
│   ├── ratings: JSON
│   └── success: Boolean
├── kidsReview: kidsReviewReturn  ‹IKidsReviewReturn›
│   ├── $kidUserId: ID
│   ├── adults: JSON
│   ├── error: String
│   ├── field: String
│   ├── goal: JSON
│   ├── hiddenCategories: JSON
│   ├── lastGoal: JSON
│   ├── ratings: JSON
│   ├── review: JSON
│   ├── success: Boolean
│   └── weekStart: String
├── kidsReviewList: kidsReviewListReturn  ‹IKidsReviewListReturn›
│   ├── $kidUserId: ID!
│   ├── error: String
│   ├── field: String
│   ├── goals: JSON
│   ├── reviews: JSON
│   └── success: Boolean
├── kidsSchool: kidsSchoolReturn  ‹IKidsSchoolReturn›
│   ├── $kidUserId: ID
│   ├── canManage: Boolean
│   ├── error: String
│   ├── exams: JSON
│   ├── field: String
│   ├── grades: JSON
│   ├── homework: JSON
│   ├── reports: JSON
│   ├── rules: JSON
│   ├── studies: JSON
│   ├── studyToday: JSON
│   ├── subjects: JSON
│   ├── success: Boolean
│   └── system: String
├── kidsStats: kidsStatsReturn  ‹IKidsStatsReturn›
│   ├── $kidUserId: ID!
│   ├── $range: Int
│   ├── error: String
│   ├── field: String
│   ├── stats: JSON
│   └── success: Boolean
├── kidsTemplateList: kidsTemplateListReturn  ‹IKidsTemplateListReturn›
│   ├── $householdId: ID!
│   ├── error: String
│   ├── field: String
│   ├── success: Boolean
│   └── templates: JSON
├── kidsToday: kidsTodayReturn  ‹IKidsTodayReturn›
│   ├── $kidUserId: ID
│   ├── error: String
│   ├── extras: JSON
│   ├── field: String
│   ├── kid: JSON
│   ├── offers: JSON
│   ├── success: Boolean
│   ├── tasks: JSON
│   └── week: JSON
├── kidsUserFind: kidsUserFindReturn  ‹IKidsUserFindReturn›
│   ├── $householdId: ID!
│   ├── $query: String!
│   ├── error: String
│   ├── field: String
│   ├── state: String
│   ├── success: Boolean
│   └── user: JSON
├── kidsWeekList: kidsWeekListReturn  ‹IKidsWeekListReturn›
│   ├── $kidUserId: ID!
│   ├── error: String
│   ├── field: String
│   ├── success: Boolean
│   └── weeks: JSON
├── kidsWishList: kidsWishListReturn  ‹IKidsWishListReturn›
│   ├── $kidUserId: ID
│   ├── dates: JSON
│   ├── error: String
│   ├── field: String
│   ├── shareToken: String
│   ├── success: Boolean
│   └── wishes: JSON
├── kidsWishPublic: kidsWishPublicReturn  ‹IKidsWishPublicReturn›
│   ├── $token: String!
│   ├── error: String
│   ├── field: String
│   ├── kidName: String
│   ├── success: Boolean
│   └── wishes: JSON
├── loadNews: loadNews  ‹ILoadNews›
│   ├── articles: [loadNewsArticles]  ‹ILoadNewsArticles›
│   │   ├── breakingNews: Boolean
│   │   ├── date: DateTime
│   │   ├── detailsweb: String
│   │   ├── firstSentence: String
│   │   ├── streams: loadNewsArticlesStreams  ‹ILoadNewsArticlesStreams›
│   │   │   └── h264m: String
│   │   ├── tags: [loadNewsArticlesTags]  ‹ILoadNewsArticlesTags›
│   │   │   └── tag: String
│   │   ├── teaserImage: loadNewsArticlesTeaserImage  ‹ILoadNewsArticlesTeaserImage›
│   │   │   └── imageVariants: JSON
│   │   ├── title: String
│   │   ├── topline: String
│   │   └── type: String
│   ├── nextPage: String
│   └── type: String
├── locationReverse: locationReverseReturn  ‹ILocationReverseReturn›
│   ├── $lat: String!
│   ├── $lon: String!
│   ├── $save: Boolean
│   ├── address: String
│   ├── geometry: JSON
│   ├── properties: JSON
│   ├── success: Boolean
│   └── type: String
├── mailerSend: mailerSendReturn  ‹IMailerSendReturn›
│   ├── $context: JSON
│   ├── $subject: String
│   ├── $template: String!
│   ├── $to: String!
│   └── success: Boolean
├── menuOpen: menuOpenReturn  ‹IMenuOpenReturn›
│   └── entries: JSON
├── myEventsCalendarList: myEventsCalendarListReturn  ‹IMyEventsCalendarListReturn›
│   ├── calendars: JSON
│   ├── error: String
│   ├── field: String
│   ├── invitations: JSON
│   └── success: Boolean
├── myEventsCalendarLoad: myEventsCalendarLoadReturn  ‹IMyEventsCalendarLoadReturn›
│   ├── $id: ID!
│   ├── calendar: JSON
│   ├── error: String
│   ├── field: String
│   ├── members: JSON
│   └── success: Boolean
├── myEventsEventHistory: myEventsEventHistoryReturn  ‹IMyEventsEventHistoryReturn›
│   ├── $id: ID!
│   ├── entries: JSON
│   ├── error: String
│   ├── field: String
│   └── success: Boolean
├── myEventsEventList: myEventsEventListReturn  ‹IMyEventsEventListReturn›
│   ├── $options: JSON!
│   ├── error: String
│   ├── events: JSON
│   ├── field: String
│   ├── success: Boolean
│   └── truncated: Boolean
├── myEventsEventLoad: myEventsEventLoadReturn  ‹IMyEventsEventLoadReturn›
│   ├── $id: ID!
│   ├── $occurrenceStart: String
│   ├── error: String
│   ├── event: JSON
│   ├── field: String
│   └── success: Boolean
├── myEventsEventTrash: myEventsEventTrashReturn  ‹IMyEventsEventTrashReturn›
│   ├── error: String
│   ├── events: JSON
│   ├── field: String
│   └── success: Boolean
├── resumeList: resumeListReturn  ‹IResumeListReturn›
│   ├── list: JSON
│   └── success: Boolean
├── resumeLoad: resumeLoadReturn  ‹IResumeLoadReturn›
│   ├── $resumeId: String!
│   ├── data: JSON
│   ├── params: JSON
│   └── success: Boolean
├── search: search  ‹ISearch›
│   ├── $active: JSON!
│   ├── $options: searchOptions!  ‹ISearchOptions›
│   │   ├── limit: Int!
│   │   └── page: Int!
│   ├── $searchTerm: String!
│   ├── groups: JSON
│   ├── groupsTotal: Int
│   ├── hrtime: String
│   ├── isEmpty: Boolean
│   ├── items: [searchItems]  ‹ISearchItems›
│   │   ├── component: String
│   │   ├── date: String
│   │   ├── description: String
│   │   ├── emit: String
│   │   ├── group: String
│   │   ├── imageUrl: String
│   │   ├── payload: JSON
│   │   ├── route: searchItemsRoute  ‹ISearchItemsRoute›
│   │   │   ├── path: String
│   │   │   └── query: JSON
│   │   ├── title: String
│   │   └── tooltip: String
│   └── total: Int
├── searchConfig: searchConfig  ‹ISearchConfig›
│   └── config: searchConfigConfig  ‹ISearchConfigConfig›
│       └── bundles: [searchConfigConfigBundles]  ‹ISearchConfigConfigBundles›
│           ├── active: Boolean
│           ├── alias: String
│           ├── label: String
│           └── sortOrder: Int
├── seoConfig: seoConfigReturn  ‹ISeoConfigReturn›
│   ├── error: String
│   ├── routes: JSON
│   ├── settings: JSON
│   └── success: Boolean
├── singleSearch: singleSearch  ‹ISingleSearch›
│   ├── $alias: String!
│   ├── $options: JSON
│   ├── $query: String
│   ├── count: Int
│   ├── limit: Int
│   ├── payload: JSON
│   ├── records: JSON
│   ├── success: Boolean
│   └── total: Int
├── sitePageGet: sitePageGetReturn  ‹ISitePageGetReturn›
│   ├── $slug: String!
│   ├── page: JSON
│   └── success: Boolean
├── sitePageMenu: sitePageMenuReturn  ‹ISitePageMenuReturn›
│   ├── items: JSON
│   └── success: Boolean
├── storageRead: storageReadReturn  ‹IStorageReadReturn›
│   ├── $key: String!
│   ├── $name: String!
│   ├── createdAt: String
│   ├── data: JSON
│   ├── exists: Boolean
│   ├── id: String
│   ├── success: Boolean
│   └── updatedAt: String
├── systemVersion: systemVersionReturn  ‹ISystemVersionReturn›
│   ├── $buildId: String
│   ├── buildId: String
│   ├── current: JSON
│   ├── deploymentId: String
│   ├── error: String
│   ├── field: String
│   ├── own: JSON
│   └── success: Boolean
├── templateRender: templateRenderReturn  ‹ITemplateRenderReturn›
│   ├── $context: JSON
│   ├── $template: String!
│   ├── html: String
│   └── success: Boolean
├── timelineBestEntries: timelineBestEntriesReturn  ‹ITimelineBestEntriesReturn›
│   ├── $limit: Int
│   ├── $period: String
│   ├── entries: JSON
│   └── success: Boolean
├── timelineCommentsListing: timelineCommentsListing  ‹ITimelineCommentsListing›
│   ├── $entryId: String!
│   ├── $page: Int!
│   ├── comments: [timelineCommentsListingComments]  ‹ITimelineCommentsListingComments›
│   │   ├── canDelete: Boolean
│   │   ├── comment: String
│   │   ├── createdAt: DateTime
│   │   ├── creator: timelineCommentsListingCommentsCreator  ‹ITimelineCommentsListingCommentsCreator›
│   │   │   ├── alias: String
│   │   │   ├── avatarUrl: String
│   │   │   └── id: String
│   │   ├── entryId: String
│   │   ├── id: String
│   │   ├── isFirst: Boolean
│   │   ├── isLast: Boolean
│   │   ├── payload: JSON
│   │   ├── state: timelineCommentsListingCommentsState  ‹ITimelineCommentsListingCommentsState›
│   │   │   ├── busy: Boolean
│   │   │   └── deleted: Boolean
│   │   └── userId: String
│   ├── hasNextPage: Boolean
│   ├── pages: Int
│   ├── success: Boolean
│   └── total: Int
├── timelineEntryEdit: timelineEntryEdit  ‹ITimelineEntryEdit›
│   ├── $entryId: ID!
│   ├── allowComments: Boolean
│   ├── anonymize: Boolean
│   ├── background: String
│   ├── category: JSON
│   ├── chart: JSON
│   ├── content: String
│   ├── draft: Boolean
│   ├── emotionState: JSON
│   ├── hasFiles: Boolean
│   ├── images: JSON
│   ├── isOwner: Boolean
│   ├── lifeEvent: JSON
│   ├── location: JSON
│   ├── public: Boolean
│   ├── searchDescription: String
│   ├── searchTitle: String
│   ├── story: String
│   ├── storyBlocks: JSON
│   ├── success: Boolean
│   ├── tags: JSON
│   ├── video: JSON
│   └── videoAllowed: Boolean
├── timelineEntryInfo: timelineEntryInfo  ‹ITimelineEntryInfo›
│   ├── $entryId: ID!
│   ├── info: timelineEntryInfoInfo  ‹ITimelineEntryInfoInfo›
│   │   ├── allowComments: Boolean
│   │   ├── anonymize: Boolean
│   │   ├── comments: timelineEntryInfoInfoComments  ‹ITimelineEntryInfoInfoComments›
│   │   │   ├── active: Boolean
│   │   │   └── total: Int
│   │   ├── draft: Boolean
│   │   └── public: Boolean
│   └── success: Boolean
├── timelineGlobalState: timelineGlobalStateReturn  ‹ITimelineGlobalStateReturn›
│   ├── clientsTotal: Int
│   └── entriesTotal: Int
├── timelineListing: timelineListing  ‹ITimelineListing›
│   ├── $options: timelineListingOptions!  ‹ITimelineListingOptions›
│   │   ├── categories: [String]
│   │   ├── category: String
│   │   ├── entryId: String
│   │   ├── listingId: ID!
│   │   ├── listingType: String
│   │   ├── page: Int!
│   │   ├── pageId: String
│   │   ├── postId: String
│   │   ├── type: [String]
│   │   └── userId: ID
│   ├── entries: [timelineListingEntries]  ‹ITimelineListingEntries›
│   │   ├── component: String
│   │   ├── createdAt: DateTime!
│   │   ├── entryType: String!
│   │   ├── generated: Boolean
│   │   ├── id: String!
│   │   ├── lastEntry: Boolean!
│   │   ├── payload: JSON!
│   │   └── userId: ID!
│   └── params: timelineListingParams  ‹ITimelineListingParams›
│       ├── currentPage: Int
│       ├── hasNextPage: Boolean
│       ├── limit: Int
│       ├── single: Boolean
│       ├── totalEntries: Int
│       └── totalPages: Int
├── timelineLoadConfig: timelineLoadConfigReturn  ‹ITimelineLoadConfigReturn›
│   ├── config: JSON
│   ├── success: Boolean
│   ├── token: String
│   └── tokenId: String
├── timelineLoadEntry: timelineLoadEntry  ‹ITimelineLoadEntry›
│   ├── $options: timelineLoadEntryOptions!  ‹ITimelineLoadEntryOptions›
│   │   └── entryId: String
│   └── entry: timelineLoadEntryEntry  ‹ITimelineLoadEntryEntry›
│       ├── data: timelineLoadEntryEntryData  ‹ITimelineLoadEntryEntryData›
│       │   ├── anonymize: Boolean
│       │   ├── category: timelineLoadEntryEntryDataCategory  ‹ITimelineLoadEntryEntryDataCategory›
│       │   │   └── …
│       │   ├── classes: JSON
│       │   ├── classesBox: String
│       │   ├── content: String
│       │   ├── createdAt: DateTime
│       │   ├── creator: timelineLoadEntryEntryDataCreator  ‹ITimelineLoadEntryEntryDataCreator›
│       │   │   └── …
│       │   ├── dataPayload: JSON
│       │   ├── draft: Boolean
│       │   ├── files: timelineLoadEntryEntryDataFiles  ‹ITimelineLoadEntryEntryDataFiles›
│       │   │   └── …
│       │   ├── highlightUntil: String
│       │   ├── highlighted: Boolean
│       │   ├── id: ID
│       │   ├── info: timelineLoadEntryEntryDataInfo  ‹ITimelineLoadEntryEntryDataInfo›
│       │   │   └── …
│       │   ├── location: String
│       │   ├── payload: JSON
│       │   ├── public: Boolean
│       │   ├── score: Int
│       │   ├── styleBox: JSON
│       │   ├── styles: JSON
│       │   ├── tags: JSON
│       │   ├── title: String
│       │   ├── type: String
│       │   ├── userId: ID
│       │   └── version: String
│       ├── hrtime: String
│       ├── rules: timelineLoadEntryEntryRules  ‹ITimelineLoadEntryEntryRules›
│       │   ├── canDelete: Boolean
│       │   ├── canEdit: Boolean
│       │   └── hasMenu: Boolean
│       └── success: Boolean
├── timelineLoadPost: timelineLoadPostReturn  ‹ITimelineLoadPostReturn›
│   ├── $entryId: ID!
│   └── post: JSON
├── timelinePageList: timelinePageListReturn  ‹ITimelinePageListReturn›
│   ├── max: Int
│   ├── pages: JSON
│   └── success: Boolean
├── timelinePageLoad: timelinePageLoadReturn  ‹ITimelinePageLoadReturn›
│   ├── $id: ID!
│   ├── exists: Boolean
│   ├── page: JSON
│   └── success: Boolean
├── tokenValidate: tokenValidateReturn  ‹ITokenValidateReturn›
│   ├── $token: String!
│   ├── expired: Boolean
│   ├── success: Boolean
│   └── valid: Boolean
├── userAliasExists: userAliasExists  ‹IUserAliasExists›
│   ├── $alias: String!
│   └── exists: Boolean
├── userCheckAuth: userCheckAuth  ‹IUserCheckAuth›
│   ├── $userRole: [String]
│   ├── authorized: Boolean
│   └── hasPromission: Boolean
├── userComparePassword: userComparePasswordReturn  ‹IUserComparePasswordReturn›
│   ├── $pwd: String!
│   └── success: Boolean
├── userEmailExists: userEmailExists  ‹IUserEmailExists›
│   ├── $email: String!
│   └── exists: Boolean
├── userGetById: userGetById  ‹IUserGetById›
│   ├── $id: String!
│   └── user: userGetByIdUser  ‹IUserGetByIdUser›
│       ├── active: Boolean
│       ├── confirmed: Boolean
│       ├── email: String
│       ├── id: String
│       ├── userRole: JSON
│       └── userType: String
├── userGetInfo: userGetInfo  ‹IUserGetInfo›
│   ├── $userId: ID!
│   ├── info: userGetInfoInfo  ‹IUserGetInfoInfo›
│   │   ├── alias: String
│   │   └── avatarUrl: String
│   └── success: Boolean
├── userGetMeta: userGetMeta  ‹IUserGetMeta›
│   ├── $userId: String!
│   └── meta: userMetaData  ‹IUserMetaData›
│       ├── alias: String
│       ├── avatarUrl: String
│       ├── email: String
│       ├── id: String
│       ├── lastLogin: DateTime
│       ├── role: JSON
│       ├── settings: userSettings  ‹IUserSettings›
│       │   ├── public: Boolean
│       │   ├── searchable: Boolean
│       │   ├── showEmail: Boolean
│       │   └── showFullName: Boolean
│       ├── superUser: Boolean
│       ├── teaserUrl: String
│       └── userType: String
├── userHasAccess: userHasAccessReturn  ‹IUserHasAccessReturn›
│   ├── $role: JSON
│   ├── authorized: Boolean
│   └── permission: Boolean
├── userInfoCard: userInfoCardReturn  ‹IUserInfoCardReturn›
│   ├── $id: ID!
│   ├── info: JSON
│   └── success: Boolean
├── userInfoList: userInfoListReturn  ‹IUserInfoListReturn›
│   ├── $ids: JSON!
│   ├── count: Int
│   ├── infoList: JSON
│   └── success: Boolean
├── userList: userList  ‹IUserList›
│   ├── $pagination: pagination  ‹IPagination›
│   │   ├── limit: Int
│   │   └── offset: Int
│   ├── $userType: String
│   ├── records: [userListRecords]  ‹IUserListRecords›
│   │   ├── alias: String
│   │   ├── avatarUrl: String
│   │   ├── birthday: DateTime
│   │   ├── email: String
│   │   ├── gender: String
│   │   ├── id: ID
│   │   ├── lastLogin: DateTime
│   │   ├── superUser: Boolean
│   │   └── userType: String
│   └── total: Int
├── userLoadConfig: userLoadConfig  ‹IUserLoadConfig›
│   ├── authorized: Boolean
│   ├── meta: userMetaData  ‹IUserMetaData›
│   │   ├── alias: String
│   │   ├── avatarUrl: String
│   │   ├── email: String
│   │   ├── id: String
│   │   ├── lastLogin: DateTime
│   │   ├── role: JSON
│   │   ├── settings: userSettings  ‹IUserSettings›
│   │   │   ├── public: Boolean
│   │   │   ├── searchable: Boolean
│   │   │   ├── showEmail: Boolean
│   │   │   └── showFullName: Boolean
│   │   ├── superUser: Boolean
│   │   ├── teaserUrl: String
│   │   └── userType: String
│   ├── refreshToken: String
│   └── userId: String
├── userLogout: userLogout  ‹IUserLogout›
│   └── success: Boolean
├── userMediaListing: userMediaListing  ‹IUserMediaListing›
│   ├── $mediaType: String
│   ├── $pagination: pagination!  ‹IPagination›
│   │   ├── limit: Int
│   │   └── offset: Int
│   ├── limit: Int
│   ├── offset: Int
│   ├── records: [userMediaListingRecords]  ‹IUserMediaListingRecords›
│   │   ├── createdAt: DateTime
│   │   ├── extension: String
│   │   ├── fileId: String
│   │   ├── id: String
│   │   ├── resources: JSON
│   │   ├── type: String
│   │   ├── updatedAt: DateTime
│   │   ├── url: String
│   │   └── userId: String
│   └── total: Int
├── userNotifyListing: userNotifyListing  ‹IUserNotifyListing›
│   ├── $filter: String
│   ├── $limit: Int
│   ├── $page: Int!
│   ├── $scope: String
│   ├── hasNextPage: Boolean
│   ├── records: [userNotifyListingRecords]  ‹IUserNotifyListingRecords›
│   │   ├── actions: [userNotifyListingRecordsActions]  ‹IUserNotifyListingRecordsActions›
│   │   │   ├── close: String
│   │   │   ├── delete: Boolean
│   │   │   ├── emit: String
│   │   │   ├── label: String
│   │   │   ├── payload: JSON
│   │   │   └── variant: String
│   │   ├── component: String
│   │   ├── date: DateTime
│   │   ├── flash: Boolean
│   │   ├── from: userNotifyListingRecordsFrom  ‹IUserNotifyListingRecordsFrom›
│   │   │   ├── alias: String
│   │   │   ├── avatarUrl: String
│   │   │   └── id: String
│   │   ├── identifier: String
│   │   ├── isLast: Boolean
│   │   ├── message: String
│   │   ├── notifyId: String
│   │   ├── payload: JSON
│   │   ├── removable: Boolean
│   │   ├── scope: String
│   │   ├── seen: Boolean
│   │   ├── title: String
│   │   ├── translate: Boolean
│   │   └── type: String
│   ├── state: userNotifyListingState  ‹IUserNotifyListingState›
│   │   ├── hasNew: Boolean
│   │   ├── total: Int
│   │   └── unread: Int
│   ├── success: Boolean
│   └── total: Int
├── userNotifyState: userNotifyState  ‹IUserNotifyState›
│   ├── $scope: String
│   ├── hasNew: Boolean
│   ├── total: Int
│   └── unread: Int
├── userProfileLoad: userProfileLoad  ‹IUserProfileLoad›
│   ├── $userId: String!
│   ├── params: userProfileParams  ‹IUserProfileParams›
│   │   ├── canView: Boolean
│   │   ├── isOwen: Boolean
│   │   ├── isPublic: Boolean
│   │   └── notExists: Boolean
│   ├── profile: userProfileData  ‹IUserProfileData›
│   │   ├── alias: String
│   │   ├── avatarUrl: String
│   │   ├── birthday: String
│   │   ├── createdAt: String
│   │   ├── description: String
│   │   ├── email: String
│   │   ├── fullName: String
│   │   ├── gender: String
│   │   ├── isAdmin: Boolean
│   │   ├── lastLogin: String
│   │   ├── online: Boolean
│   │   ├── teaserUrl: String
│   │   ├── userId: String
│   │   └── userType: String
│   ├── relation: userRelation  ‹IUserRelation›
│   │   ├── blockedBy: String
│   │   ├── id: String
│   │   ├── relationId: String
│   │   ├── requestBy: String
│   │   ├── sourceId: String
│   │   ├── status: String
│   │   └── targetId: String
│   ├── success: Boolean
│   └── userId: String
├── userRelationList: userRelationListReturn  ‹IUserRelationListReturn›
│   ├── $limit: Int!
│   ├── $offset: Int!
│   ├── $status: String
│   ├── list: JSON
│   ├── success: Boolean
│   └── total: Int
└── userRelationState: userRelationStateReturn  ‹IUserRelationStateReturn›
    ├── $sourceId: ID
    ├── $targetId: ID
    ├── relation: userRelation  ‹IUserRelation›
    │   ├── blockedBy: String
    │   ├── id: String
    │   ├── relationId: String
    │   ├── requestBy: String
    │   ├── sourceId: String
    │   ├── status: String
    │   └── targetId: String
    └── success: Boolean
```

## Mutation

```text
Mutation  ‹IMutation›
├── accountSelfDelete: accountSelfDeleteReturn  ‹IAccountSelfDeleteReturn›
│   ├── $userId: String!
│   └── success: Boolean
├── accountSelfUpdate: accountSelfUpdateReturn  ‹IAccountSelfUpdateReturn›
│   ├── $accountData: accountUpdateData!  ‹IAccountUpdateData›
│   │   ├── alias: String!
│   │   ├── birthday: String
│   │   ├── description: userDescriptionInput!  ‹IUserDescriptionInput›
│   │   │   └── html: String!
│   │   ├── details: userDetailsInput  ‹IUserDetailsInput›
│   │   │   ├── firstname: String
│   │   │   └── lastname: String
│   │   ├── gender: String!
│   │   ├── id: ID!
│   │   └── settings: userSettingsInput!  ‹IUserSettingsInput›
│   │       ├── public: Boolean!
│   │       ├── searchable: Boolean!
│   │       ├── showEmail: Boolean!
│   │       └── showFullName: Boolean!
│   └── success: Boolean
├── accountSelfUpdateSettings: accountSelfUpdateSettingsReturn  ‹IAccountSelfUpdateSettingsReturn›
│   ├── $settings: userSettingsInput!  ‹IUserSettingsInput›
│   │   ├── public: Boolean!
│   │   ├── searchable: Boolean!
│   │   ├── showEmail: Boolean!
│   │   └── showFullName: Boolean!
│   ├── $userId: String!
│   └── success: Boolean
├── adminAddRole: adminAddRoleReturn  ‹IAdminAddRoleReturn›
│   ├── $active: Boolean!
│   ├── $userId: ID!
│   ├── $userRole: String!
│   └── success: JSON
├── adminAddUserRole: adminAddUserRoleReturn  ‹IAdminAddUserRoleReturn›
│   ├── $state: Boolean!
│   ├── $userId: ID!
│   ├── $userRole: String!
│   └── success: Boolean
├── adminPageCreate: adminPageCreateReturn  ‹IAdminPageCreateReturn›
│   ├── $values: JSON!
│   ├── page: JSON
│   └── success: Boolean
├── adminPageDelete: adminPageDeleteReturn  ‹IAdminPageDeleteReturn›
│   ├── $id: ID!
│   └── success: Boolean
├── adminPageImageDiscard: adminPageImageDiscardReturn  ‹IAdminPageImageDiscardReturn›
│   ├── $urls: [String]!
│   ├── removed: Int
│   └── success: Boolean
├── adminPageImageKeep: adminPageImageKeepReturn  ‹IAdminPageImageKeepReturn›
│   ├── $urls: [String]!
│   ├── missing: JSON
│   └── success: Boolean
├── adminPageImageUpload: adminPageImageUploadReturn  ‹IAdminPageImageUploadReturn›
│   ├── $file: [Upload]!
│   ├── success: Boolean
│   └── url: String
├── adminPageUpdate: adminPageUpdateReturn  ‹IAdminPageUpdateReturn›
│   ├── $id: ID!
│   ├── $values: JSON!
│   ├── page: JSON
│   └── success: Boolean
├── adminRoleAdd: adminRoleAddReturn  ‹IAdminRoleAddReturn›
│   ├── $roles: JSON!
│   ├── $userId: ID!
│   ├── success: Boolean
│   └── user: JSON
├── adminRoleUpdate: adminRoleUpdateReturn  ‹IAdminRoleUpdateReturn›
│   ├── $action: String!
│   ├── $role: String!
│   ├── $to: String
│   ├── $userId: ID!
│   ├── success: Boolean
│   └── user: JSON
├── adminSeoRouteDelete: adminSeoRouteDeleteReturn  ‹IAdminSeoRouteDeleteReturn›
│   ├── $id: ID!
│   ├── error: String
│   ├── field: String
│   └── success: Boolean
├── adminSeoRouteSave: adminSeoRouteSaveReturn  ‹IAdminSeoRouteSaveReturn›
│   ├── $id: ID
│   ├── $values: JSON!
│   ├── error: String
│   ├── field: String
│   ├── route: JSON
│   └── success: Boolean
├── adminSeoSettingsSave: adminSeoSettingsSaveReturn  ‹IAdminSeoSettingsSaveReturn›
│   ├── $values: JSON!
│   ├── error: String
│   ├── field: String
│   ├── settings: JSON
│   └── success: Boolean
├── adminSeoSitemap: adminSeoSitemapReturn  ‹IAdminSeoSitemapReturn›
│   ├── error: String
│   ├── field: String
│   ├── sitemap: JSON
│   └── success: Boolean
├── adminStatsRemind: adminStatsRemindReturn  ‹IAdminStatsRemindReturn›
│   ├── $userId: ID!
│   ├── error: String
│   ├── field: String
│   └── success: Boolean
├── adminSystemReleasePlan: adminSystemReleasePlanReturn  ‹IAdminSystemReleasePlanReturn›
│   ├── $bump: String
│   ├── $notes: String
│   ├── $required: Boolean
│   ├── error: String
│   ├── field: String
│   ├── release: JSON
│   └── success: Boolean
├── authAdminBan: authAdminBanReturn  ‹IAuthAdminBanReturn›
│   ├── $reason: String
│   ├── $until: String
│   ├── $userId: ID!
│   ├── ban: JSON
│   ├── error: String
│   ├── field: String
│   ├── retryAfter: Int
│   └── success: Boolean
├── authAdminUnban: authAdminUnbanReturn  ‹IAuthAdminUnbanReturn›
│   ├── $userId: ID!
│   ├── ban: JSON
│   ├── error: String
│   ├── field: String
│   ├── retryAfter: Int
│   └── success: Boolean
├── authCodeSend: authCodeSendReturn  ‹IAuthCodeSendReturn›
│   ├── $identifier: String!
│   ├── $purpose: String!
│   ├── error: String
│   ├── field: String
│   ├── retryAfter: Int
│   └── success: Boolean
├── authCodeVerify: authCodeVerifyReturn  ‹IAuthCodeVerifyReturn›
│   ├── $code: String!
│   ├── $device: JSON
│   ├── $identifier: String!
│   ├── $purpose: String!
│   ├── authToken: String
│   ├── banReason: String
│   ├── bannedUntil: String
│   ├── deletionPending: String
│   ├── error: String
│   ├── field: String
│   ├── meta: JSON
│   ├── retryAfter: Int
│   ├── step: String
│   ├── success: Boolean
│   ├── ticket: String
│   └── userId: String
├── authDeleteCancel: authDeleteCancelReturn  ‹IAuthDeleteCancelReturn›
│   ├── error: String
│   ├── field: String
│   ├── retryAfter: Int
│   └── success: Boolean
├── authDeleteRequest: authDeleteRequestReturn  ‹IAuthDeleteRequestReturn›
│   ├── deleteAt: String
│   ├── error: String
│   ├── field: String
│   ├── retryAfter: Int
│   └── success: Boolean
├── authEmailChange: authEmailChangeReturn  ‹IAuthEmailChangeReturn›
│   ├── $email: String!
│   ├── error: String
│   ├── field: String
│   ├── retryAfter: Int
│   └── success: Boolean
├── authEmailConfirm: authEmailConfirmReturn  ‹IAuthEmailConfirmReturn›
│   ├── $code: String!
│   ├── email: String
│   ├── error: String
│   ├── field: String
│   ├── retryAfter: Int
│   └── success: Boolean
├── authExport: authExportReturn  ‹IAuthExportReturn›
│   ├── data: JSON
│   ├── error: String
│   ├── field: String
│   ├── retryAfter: Int
│   └── success: Boolean
├── authInviteRenew: authInviteRenewReturn  ‹IAuthInviteRenewReturn›
│   ├── error: String
│   ├── expiresAt: String
│   ├── field: String
│   ├── retryAfter: Int
│   ├── success: Boolean
│   ├── token: String
│   └── uses: Int
├── authPasskeyLogin: authPasskeyLoginReturn  ‹IAuthPasskeyLoginReturn›
│   ├── $challengeId: String!
│   ├── $credential: JSON!
│   ├── $device: JSON
│   ├── authToken: String
│   ├── banReason: String
│   ├── bannedUntil: String
│   ├── deletionPending: String
│   ├── error: String
│   ├── field: String
│   ├── meta: JSON
│   ├── retryAfter: Int
│   ├── step: String
│   ├── success: Boolean
│   ├── ticket: String
│   └── userId: String
├── authPasskeyOptions: authPasskeyOptionsReturn  ‹IAuthPasskeyOptionsReturn›
│   ├── $identifier: String
│   ├── challengeId: String
│   ├── error: String
│   ├── field: String
│   ├── options: JSON
│   ├── retryAfter: Int
│   └── success: Boolean
├── authPasskeyRegister: authPasskeyRegisterReturn  ‹IAuthPasskeyRegisterReturn›
│   ├── $challengeId: String!
│   ├── $credential: JSON!
│   ├── $device: JSON
│   ├── $name: String
│   ├── error: String
│   ├── field: String
│   ├── passkey: JSON
│   ├── passkeys: JSON
│   ├── retryAfter: Int
│   └── success: Boolean
├── authPasskeyRegisterOptions: authPasskeyRegisterOptionsReturn  ‹IAuthPasskeyRegisterOptionsReturn›
│   ├── challengeId: String
│   ├── error: String
│   ├── field: String
│   ├── options: JSON
│   ├── retryAfter: Int
│   └── success: Boolean
├── authPasskeyRemove: authPasskeyRemoveReturn  ‹IAuthPasskeyRemoveReturn›
│   ├── $id: ID!
│   ├── error: String
│   ├── field: String
│   ├── passkey: JSON
│   ├── passkeys: JSON
│   ├── retryAfter: Int
│   └── success: Boolean
├── authPasskeyRename: authPasskeyRenameReturn  ‹IAuthPasskeyRenameReturn›
│   ├── $id: ID!
│   ├── $name: String!
│   ├── error: String
│   ├── field: String
│   ├── passkey: JSON
│   ├── passkeys: JSON
│   ├── retryAfter: Int
│   └── success: Boolean
├── authPassword: authPasswordReturn  ‹IAuthPasswordReturn›
│   ├── $device: JSON
│   ├── $identifier: String!
│   ├── $password: String!
│   ├── authToken: String
│   ├── banReason: String
│   ├── bannedUntil: String
│   ├── deletionPending: String
│   ├── error: String
│   ├── field: String
│   ├── meta: JSON
│   ├── retryAfter: Int
│   ├── step: String
│   ├── success: Boolean
│   ├── ticket: String
│   └── userId: String
├── authPasswordSet: authPasswordSetReturn  ‹IAuthPasswordSetReturn›
│   ├── $password: String!
│   ├── error: String
│   ├── field: String
│   ├── retryAfter: Int
│   └── success: Boolean
├── authRecoveryRenew: authRecoveryRenewReturn  ‹IAuthRecoveryRenewReturn›
│   ├── error: String
│   ├── field: String
│   ├── recoveryCodes: JSON
│   ├── retryAfter: Int
│   └── success: Boolean
├── authRegister: authRegisterReturn  ‹IAuthRegisterReturn›
│   ├── $device: JSON
│   ├── $ticket: String!
│   ├── $values: JSON!
│   ├── authToken: String
│   ├── banReason: String
│   ├── bannedUntil: String
│   ├── deletionPending: String
│   ├── error: String
│   ├── field: String
│   ├── meta: JSON
│   ├── retryAfter: Int
│   ├── step: String
│   ├── success: Boolean
│   ├── ticket: String
│   └── userId: String
├── authReset: authResetReturn  ‹IAuthResetReturn›
│   ├── $device: JSON
│   ├── $password: String!
│   ├── $ticket: String!
│   ├── authToken: String
│   ├── banReason: String
│   ├── bannedUntil: String
│   ├── deletionPending: String
│   ├── error: String
│   ├── field: String
│   ├── meta: JSON
│   ├── retryAfter: Int
│   ├── step: String
│   ├── success: Boolean
│   ├── ticket: String
│   └── userId: String
├── authSessionRevoke: authSessionRevokeReturn  ‹IAuthSessionRevokeReturn›
│   ├── $id: ID!
│   ├── count: Int
│   ├── error: String
│   ├── field: String
│   ├── retryAfter: Int
│   ├── sessions: JSON
│   └── success: Boolean
├── authSessionRevokeOthers: authSessionRevokeOthersReturn  ‹IAuthSessionRevokeOthersReturn›
│   ├── count: Int
│   ├── error: String
│   ├── field: String
│   ├── retryAfter: Int
│   ├── sessions: JSON
│   └── success: Boolean
├── authSudo: authSudoReturn  ‹IAuthSudoReturn›
│   ├── $device: JSON
│   ├── $values: JSON!
│   ├── error: String
│   ├── field: String
│   ├── retryAfter: Int
│   ├── success: Boolean
│   └── sudoUntil: String
├── authSudoCodeSend: authSudoCodeSendReturn  ‹IAuthSudoCodeSendReturn›
│   ├── error: String
│   ├── field: String
│   ├── retryAfter: Int
│   └── success: Boolean
├── authSudoPasskeyOptions: authSudoPasskeyOptionsReturn  ‹IAuthSudoPasskeyOptionsReturn›
│   ├── challengeId: String
│   ├── error: String
│   ├── field: String
│   ├── options: JSON
│   ├── retryAfter: Int
│   └── success: Boolean
├── authTotp: authTotpReturn  ‹IAuthTotpReturn›
│   ├── $code: String!
│   ├── $device: JSON
│   ├── $ticket: String!
│   ├── authToken: String
│   ├── banReason: String
│   ├── bannedUntil: String
│   ├── deletionPending: String
│   ├── error: String
│   ├── field: String
│   ├── meta: JSON
│   ├── retryAfter: Int
│   ├── step: String
│   ├── success: Boolean
│   ├── ticket: String
│   └── userId: String
├── authTotpDisable: authTotpDisableReturn  ‹IAuthTotpDisableReturn›
│   ├── error: String
│   ├── field: String
│   ├── retryAfter: Int
│   └── success: Boolean
├── authTotpEnable: authTotpEnableReturn  ‹IAuthTotpEnableReturn›
│   ├── $code: String!
│   ├── error: String
│   ├── field: String
│   ├── recoveryCodes: JSON
│   ├── retryAfter: Int
│   └── success: Boolean
├── authTotpSetup: authTotpSetupReturn  ‹IAuthTotpSetupReturn›
│   ├── error: String
│   ├── field: String
│   ├── retryAfter: Int
│   ├── secret: String
│   ├── success: Boolean
│   └── uri: String
├── configImport: configImportReturn  ‹IConfigImportReturn›
│   ├── configs: JSON
│   └── success: Boolean
├── createAuthToken: createAuthTokenReturn  ‹ICreateAuthTokenReturn›
│   ├── $email: String!
│   ├── $password: String!
│   ├── authToken: String
│   └── success: Boolean
├── createDummyUsers: createDummyUsersReturn  ‹ICreateDummyUsersReturn›
│   ├── $count: Int
│   └── success: Boolean
├── cronExecute: cronExecuteReturn  ‹ICronExecuteReturn›
│   ├── $name: String!
│   ├── id: String
│   ├── result: JSON
│   └── success: Boolean
├── DbResourceCreate: dbResourceCreateResult  ‹IDbResourceCreateResult›
│   ├── $alias: String!
│   ├── $records: [JSON!]!
│   ├── requestId: String
│   └── success: Boolean
├── DbResourceDelete: dbResourceDeleteResult  ‹IDbResourceDeleteResult›
│   ├── $alias: String!
│   ├── $ids: [JSON!]!
│   ├── requestId: String
│   └── success: Boolean
├── DbResourceWrite: dbResourceWriteResult  ‹IDbResourceWriteResult›
│   ├── $alias: String!
│   ├── $records: [JSON!]!
│   └── success: Boolean
├── deleteAllDummyUsers: deleteAllDummyUsersReturn  ‹IDeleteAllDummyUsersReturn›
│   └── success: Boolean
├── deleteMedia: deleteMediaReturn  ‹IDeleteMediaReturn›
│   ├── $id: ID!
│   └── success: Boolean
├── developerTest: developerTestReturn  ‹IDeveloperTestReturn›
│   ├── $delay: Int
│   └── success: Boolean
├── forumCommentCreate: forumCommentCreateReturn  ‹IForumCommentCreateReturn›
│   ├── $values: JSON!
│   ├── comment: JSON
│   ├── error: String
│   └── success: Boolean
├── forumCommentDelete: forumCommentDeleteReturn  ‹IForumCommentDeleteReturn›
│   ├── $commentId: ID!
│   ├── error: String
│   └── success: Boolean
├── forumCommentUpdate: forumCommentUpdateReturn  ‹IForumCommentUpdateReturn›
│   ├── $body: String!
│   ├── $commentId: ID!
│   ├── comment: JSON
│   ├── error: String
│   └── success: Boolean
├── forumCommunityCreate: forumCommunityCreateReturn  ‹IForumCommunityCreateReturn›
│   ├── $values: JSON!
│   ├── community: JSON
│   ├── error: String
│   └── success: Boolean
├── forumCommunityJoin: forumCommunityJoinReturn  ‹IForumCommunityJoinReturn›
│   ├── $join: Boolean!
│   ├── $slug: String!
│   ├── community: JSON
│   ├── error: String
│   └── success: Boolean
├── forumCommunityRole: forumCommunityRoleReturn  ‹IForumCommunityRoleReturn›
│   ├── $role: String!
│   ├── $slug: String!
│   ├── $userId: ID!
│   ├── error: String
│   └── success: Boolean
├── forumCommunityUpdate: forumCommunityUpdateReturn  ‹IForumCommunityUpdateReturn›
│   ├── $slug: String!
│   ├── $values: JSON!
│   ├── community: JSON
│   ├── error: String
│   └── success: Boolean
├── forumPostCreate: forumPostCreateReturn  ‹IForumPostCreateReturn›
│   ├── $files: [Upload]
│   ├── $values: JSON!
│   ├── error: String
│   ├── post: JSON
│   └── success: Boolean
├── forumPostDelete: forumPostDeleteReturn  ‹IForumPostDeleteReturn›
│   ├── $postId: ID!
│   ├── error: String
│   └── success: Boolean
├── forumPostModerate: forumPostModerateReturn  ‹IForumPostModerateReturn›
│   ├── $action: String!
│   ├── $postId: ID!
│   ├── error: String
│   ├── post: JSON
│   └── success: Boolean
├── forumPostUpdate: forumPostUpdateReturn  ‹IForumPostUpdateReturn›
│   ├── $postId: ID!
│   ├── $values: JSON!
│   ├── error: String
│   ├── post: JSON
│   └── success: Boolean
├── forumVote: forumVoteReturn  ‹IForumVoteReturn›
│   ├── $id: ID!
│   ├── $target: String!
│   ├── $value: Int!
│   ├── error: String
│   ├── myVote: Int
│   ├── score: Int
│   └── success: Boolean
├── googleAuthAfter: googleAuthAfterReturn  ‹IGoogleAuthAfterReturn›
│   ├── $accessToken: String!
│   ├── $idToken: String!
│   ├── $nonce: String!
│   ├── gapi_exd: String
│   ├── gapi_pxd: String
│   └── success: Boolean
├── kidsAccountAdjust: kidsAccountAdjustReturn  ‹IKidsAccountAdjustReturn›
│   ├── $amountCents: Int!
│   ├── $kidUserId: ID!
│   ├── $note: String
│   ├── account: JSON
│   ├── error: String
│   ├── field: String
│   └── success: Boolean
├── kidsAccountSettings: kidsAccountSettingsReturn  ‹IKidsAccountSettingsReturn›
│   ├── $allowanceCents: Int
│   ├── $kidUserId: ID!
│   ├── $weekday: Int!
│   ├── account: JSON
│   ├── error: String
│   ├── field: String
│   └── success: Boolean
├── kidsComfortDelete: kidsComfortDeleteReturn  ‹IKidsComfortDeleteReturn›
│   ├── $id: ID!
│   ├── error: String
│   ├── field: String
│   └── success: Boolean
├── kidsComfortRead: kidsComfortReadReturn  ‹IKidsComfortReadReturn›
│   ├── $id: ID!
│   ├── error: String
│   ├── field: String
│   ├── message: JSON
│   └── success: Boolean
├── kidsComfortReply: kidsComfortReplyReturn  ‹IKidsComfortReplyReturn›
│   ├── $id: ID!
│   ├── $text: String!
│   ├── error: String
│   ├── field: String
│   ├── message: JSON
│   └── success: Boolean
├── kidsComfortSend: kidsComfortSendReturn  ‹IKidsComfortSendReturn›
│   ├── $files: [Upload]
│   ├── $values: JSON!
│   ├── error: String
│   ├── field: String
│   ├── message: JSON
│   └── success: Boolean
├── kidsConnectAnswer: kidsConnectAnswerReturn  ‹IKidsConnectAnswerReturn›
│   ├── $accept: Boolean!
│   ├── $id: ID!
│   ├── connected: Boolean
│   ├── error: String
│   ├── field: String
│   ├── request: JSON
│   └── success: Boolean
├── kidsConnectCancel: kidsConnectCancelReturn  ‹IKidsConnectCancelReturn›
│   ├── $id: ID!
│   ├── error: String
│   ├── field: String
│   └── success: Boolean
├── kidsConnectDecide: kidsConnectDecideReturn  ‹IKidsConnectDecideReturn›
│   ├── $access: String
│   ├── $approve: Boolean!
│   ├── $id: ID!
│   ├── connected: Boolean
│   ├── error: String
│   ├── field: String
│   ├── request: JSON
│   └── success: Boolean
├── kidsConnectRequest: kidsConnectRequestReturn  ‹IKidsConnectRequestReturn›
│   ├── $access: String
│   ├── $householdId: ID!
│   ├── $kidUserId: ID!
│   ├── $label: String
│   ├── $relation: String
│   ├── connected: Boolean
│   ├── error: String
│   ├── field: String
│   ├── request: JSON
│   └── success: Boolean
├── kidsExamAdd: kidsExamAddReturn  ‹IKidsExamAddReturn›
│   ├── $values: JSON!
│   ├── canManage: Boolean
│   ├── error: String
│   ├── exams: JSON
│   ├── field: String
│   ├── grades: JSON
│   ├── homework: JSON
│   ├── reports: JSON
│   ├── rules: JSON
│   ├── studies: JSON
│   ├── studyToday: JSON
│   ├── subjects: JSON
│   ├── success: Boolean
│   └── system: String
├── kidsExamDelete: kidsExamDeleteReturn  ‹IKidsExamDeleteReturn›
│   ├── $id: ID!
│   ├── canManage: Boolean
│   ├── error: String
│   ├── exams: JSON
│   ├── field: String
│   ├── grades: JSON
│   ├── homework: JSON
│   ├── reports: JSON
│   ├── rules: JSON
│   ├── studies: JSON
│   ├── studyToday: JSON
│   ├── subjects: JSON
│   ├── success: Boolean
│   └── system: String
├── kidsGradeAdd: kidsGradeAddReturn  ‹IKidsGradeAddReturn›
│   ├── $files: [Upload]
│   ├── $values: JSON!
│   ├── canManage: Boolean
│   ├── error: String
│   ├── exams: JSON
│   ├── field: String
│   ├── grades: JSON
│   ├── homework: JSON
│   ├── reports: JSON
│   ├── rules: JSON
│   ├── studies: JSON
│   ├── studyToday: JSON
│   ├── subjects: JSON
│   ├── success: Boolean
│   └── system: String
├── kidsGradeConfirm: kidsGradeConfirmReturn  ‹IKidsGradeConfirmReturn›
│   ├── $id: ID!
│   ├── canManage: Boolean
│   ├── error: String
│   ├── exams: JSON
│   ├── field: String
│   ├── grades: JSON
│   ├── homework: JSON
│   ├── reports: JSON
│   ├── rules: JSON
│   ├── studies: JSON
│   ├── studyToday: JSON
│   ├── subjects: JSON
│   ├── success: Boolean
│   └── system: String
├── kidsGradeDelete: kidsGradeDeleteReturn  ‹IKidsGradeDeleteReturn›
│   ├── $id: ID!
│   ├── canManage: Boolean
│   ├── error: String
│   ├── exams: JSON
│   ├── field: String
│   ├── grades: JSON
│   ├── homework: JSON
│   ├── reports: JSON
│   ├── rules: JSON
│   ├── studies: JSON
│   ├── studyToday: JSON
│   ├── subjects: JSON
│   ├── success: Boolean
│   └── system: String
├── kidsGradeSign: kidsGradeSignReturn  ‹IKidsGradeSignReturn›
│   ├── $id: ID!
│   ├── canManage: Boolean
│   ├── error: String
│   ├── exams: JSON
│   ├── field: String
│   ├── grades: JSON
│   ├── homework: JSON
│   ├── reports: JSON
│   ├── rules: JSON
│   ├── studies: JSON
│   ├── studyToday: JSON
│   ├── subjects: JSON
│   ├── success: Boolean
│   └── system: String
├── kidsHomeworkAdd: kidsHomeworkAddReturn  ‹IKidsHomeworkAddReturn›
│   ├── $kidUserId: ID
│   ├── $values: JSON!
│   ├── canManage: Boolean
│   ├── error: String
│   ├── exams: JSON
│   ├── field: String
│   ├── grades: JSON
│   ├── homework: JSON
│   ├── reports: JSON
│   ├── rules: JSON
│   ├── studies: JSON
│   ├── studyToday: JSON
│   ├── subjects: JSON
│   ├── success: Boolean
│   └── system: String
├── kidsHomeworkDelete: kidsHomeworkDeleteReturn  ‹IKidsHomeworkDeleteReturn›
│   ├── $id: ID!
│   ├── canManage: Boolean
│   ├── error: String
│   ├── exams: JSON
│   ├── field: String
│   ├── grades: JSON
│   ├── homework: JSON
│   ├── reports: JSON
│   ├── rules: JSON
│   ├── studies: JSON
│   ├── studyToday: JSON
│   ├── subjects: JSON
│   ├── success: Boolean
│   └── system: String
├── kidsHouseholdCreate: kidsHouseholdCreateReturn  ‹IKidsHouseholdCreateReturn›
│   ├── $values: JSON!
│   ├── error: String
│   ├── field: String
│   ├── household: JSON
│   └── success: Boolean
├── kidsHouseholdUpdate: kidsHouseholdUpdateReturn  ‹IKidsHouseholdUpdateReturn›
│   ├── $householdId: ID!
│   ├── $values: JSON!
│   ├── error: String
│   ├── field: String
│   ├── household: JSON
│   └── success: Boolean
├── kidsKidAddHousehold: kidsKidAddHouseholdReturn  ‹IKidsKidAddHouseholdReturn›
│   ├── $householdId: ID!
│   ├── $kidUserId: ID!
│   ├── error: String
│   ├── field: String
│   ├── kid: JSON
│   ├── links: JSON
│   └── success: Boolean
├── kidsKidMoney: kidsKidMoneyReturn  ‹IKidsKidMoneyReturn›
│   ├── $kidUserId: ID!
│   ├── $values: JSON!
│   ├── error: String
│   ├── field: String
│   ├── kid: JSON
│   ├── links: JSON
│   └── success: Boolean
├── kidsKidMoneyDecide: kidsKidMoneyDecideReturn  ‹IKidsKidMoneyDecideReturn›
│   ├── $approve: Boolean!
│   ├── $kidUserId: ID!
│   ├── error: String
│   ├── field: String
│   ├── kid: JSON
│   ├── links: JSON
│   └── success: Boolean
├── kidsKidUpdate: kidsKidUpdateReturn  ‹IKidsKidUpdateReturn›
│   ├── $kidUserId: ID!
│   ├── $values: JSON!
│   ├── error: String
│   ├── field: String
│   ├── kid: JSON
│   ├── links: JSON
│   └── success: Boolean
├── kidsLinkUpdate: kidsLinkUpdateReturn  ‹IKidsLinkUpdateReturn›
│   ├── $adultUserId: ID!
│   ├── $kidUserId: ID!
│   ├── $values: JSON!
│   ├── error: String
│   ├── field: String
│   ├── kid: JSON
│   ├── links: JSON
│   └── success: Boolean
├── kidsMemberAccept: kidsMemberAcceptReturn  ‹IKidsMemberAcceptReturn›
│   ├── $householdId: ID!
│   ├── error: String
│   ├── field: String
│   ├── household: JSON
│   └── success: Boolean
├── kidsMemberDecline: kidsMemberDeclineReturn  ‹IKidsMemberDeclineReturn›
│   ├── $householdId: ID!
│   ├── error: String
│   ├── field: String
│   └── success: Boolean
├── kidsMemberInvite: kidsMemberInviteReturn  ‹IKidsMemberInviteReturn›
│   ├── $access: String!
│   ├── $householdId: ID!
│   ├── $label: String
│   ├── $relation: String
│   ├── $userIds: JSON!
│   ├── error: String
│   ├── field: String
│   ├── household: JSON
│   └── success: Boolean
├── kidsMemberLeave: kidsMemberLeaveReturn  ‹IKidsMemberLeaveReturn›
│   ├── $householdId: ID!
│   ├── error: String
│   ├── field: String
│   └── success: Boolean
├── kidsMemberRemove: kidsMemberRemoveReturn  ‹IKidsMemberRemoveReturn›
│   ├── $householdId: ID!
│   ├── $userId: ID!
│   ├── error: String
│   ├── field: String
│   ├── household: JSON
│   └── success: Boolean
├── kidsMoneyRequest: kidsMoneyRequestReturn  ‹IKidsMoneyRequestReturn›
│   ├── $amountCents: Int!
│   ├── $note: String
│   ├── account: JSON
│   ├── error: String
│   ├── field: String
│   └── success: Boolean
├── kidsMoneyRequestDecide: kidsMoneyRequestDecideReturn  ‹IKidsMoneyRequestDecideReturn›
│   ├── $approve: Boolean!
│   ├── $id: ID!
│   ├── account: JSON
│   ├── error: String
│   ├── field: String
│   └── success: Boolean
├── kidsPointsAdd: kidsPointsAddReturn  ‹IKidsPointsAddReturn›
│   ├── $kidUserId: ID!
│   ├── $points: Int!
│   ├── $reason: String
│   ├── entries: JSON
│   ├── error: String
│   ├── field: String
│   ├── success: Boolean
│   └── week: JSON
├── kidsPracticeAnswer: kidsPracticeAnswerReturn  ‹IKidsPracticeAnswerReturn›
│   ├── $id: ID!
│   ├── $index: Int!
│   ├── $value: String!
│   ├── error: String
│   ├── field: String
│   ├── run: JSON
│   └── success: Boolean
├── kidsPracticeDelete: kidsPracticeDeleteReturn  ‹IKidsPracticeDeleteReturn›
│   ├── $id: ID!
│   ├── canManage: Boolean
│   ├── error: String
│   ├── exams: JSON
│   ├── field: String
│   ├── practices: JSON
│   ├── savedId: String
│   ├── subjects: JSON
│   └── success: Boolean
├── kidsPracticeFinish: kidsPracticeFinishReturn  ‹IKidsPracticeFinishReturn›
│   ├── $id: ID!
│   ├── error: String
│   ├── field: String
│   ├── run: JSON
│   └── success: Boolean
├── kidsPracticeImage: kidsPracticeImageReturn  ‹IKidsPracticeImageReturn›
│   ├── $files: [Upload]
│   ├── $id: ID!
│   ├── $remove: Boolean
│   ├── canManage: Boolean
│   ├── error: String
│   ├── exams: JSON
│   ├── field: String
│   ├── practices: JSON
│   ├── savedId: String
│   ├── subjects: JSON
│   └── success: Boolean
├── kidsPracticeReview: kidsPracticeReviewReturn  ‹IKidsPracticeReviewReturn›
│   ├── $id: ID!
│   ├── $note: String
│   ├── $percent: Int!
│   ├── error: String
│   ├── field: String
│   ├── run: JSON
│   └── success: Boolean
├── kidsPracticeSave: kidsPracticeSaveReturn  ‹IKidsPracticeSaveReturn›
│   ├── $id: ID
│   ├── $kidUserId: ID!
│   ├── $values: JSON!
│   ├── canManage: Boolean
│   ├── error: String
│   ├── exams: JSON
│   ├── field: String
│   ├── practices: JSON
│   ├── savedId: String
│   ├── subjects: JSON
│   └── success: Boolean
├── kidsPracticeStart: kidsPracticeStartReturn  ‹IKidsPracticeStartReturn›
│   ├── $id: ID!
│   ├── $mistakes: Boolean
│   ├── error: String
│   ├── field: String
│   ├── run: JSON
│   └── success: Boolean
├── kidsPracticeSubmit: kidsPracticeSubmitReturn  ‹IKidsPracticeSubmitReturn›
│   ├── $files: [Upload]
│   ├── $id: ID!
│   ├── $note: String
│   ├── error: String
│   ├── field: String
│   ├── run: JSON
│   └── success: Boolean
├── kidsRate: kidsRateReturn  ‹IKidsRateReturn›
│   ├── $values: JSON!
│   ├── adults: JSON
│   ├── error: String
│   ├── field: String
│   ├── goal: JSON
│   ├── hiddenCategories: JSON
│   ├── lastGoal: JSON
│   ├── ratings: JSON
│   ├── review: JSON
│   ├── success: Boolean
│   └── weekStart: String
├── kidsRatingReply: kidsRatingReplyReturn  ‹IKidsRatingReplyReturn›
│   ├── $id: ID!
│   ├── $text: String
│   ├── $wishDone: Boolean
│   ├── error: String
│   ├── field: String
│   ├── ratings: JSON
│   └── success: Boolean
├── kidsReportAdd: kidsReportAddReturn  ‹IKidsReportAddReturn›
│   ├── $files: [Upload]
│   ├── $kidUserId: ID!
│   ├── $values: JSON!
│   ├── canManage: Boolean
│   ├── error: String
│   ├── exams: JSON
│   ├── field: String
│   ├── grades: JSON
│   ├── homework: JSON
│   ├── reports: JSON
│   ├── rules: JSON
│   ├── studies: JSON
│   ├── studyToday: JSON
│   ├── subjects: JSON
│   ├── success: Boolean
│   └── system: String
├── kidsReportDelete: kidsReportDeleteReturn  ‹IKidsReportDeleteReturn›
│   ├── $id: ID!
│   ├── canManage: Boolean
│   ├── error: String
│   ├── exams: JSON
│   ├── field: String
│   ├── grades: JSON
│   ├── homework: JSON
│   ├── reports: JSON
│   ├── rules: JSON
│   ├── studies: JSON
│   ├── studyToday: JSON
│   ├── subjects: JSON
│   ├── success: Boolean
│   └── system: String
├── kidsReportUpdate: kidsReportUpdateReturn  ‹IKidsReportUpdateReturn›
│   ├── $files: [Upload]
│   ├── $id: ID!
│   ├── $values: JSON!
│   ├── canManage: Boolean
│   ├── error: String
│   ├── exams: JSON
│   ├── field: String
│   ├── grades: JSON
│   ├── homework: JSON
│   ├── reports: JSON
│   ├── rules: JSON
│   ├── studies: JSON
│   ├── studyToday: JSON
│   ├── subjects: JSON
│   ├── success: Boolean
│   └── system: String
├── kidsReviewGoal: kidsReviewGoalReturn  ‹IKidsReviewGoalReturn›
│   ├── $text: String!
│   ├── adults: JSON
│   ├── error: String
│   ├── field: String
│   ├── goal: JSON
│   ├── hiddenCategories: JSON
│   ├── lastGoal: JSON
│   ├── ratings: JSON
│   ├── review: JSON
│   ├── success: Boolean
│   └── weekStart: String
├── kidsReviewGoalAchieved: kidsReviewGoalAchievedReturn  ‹IKidsReviewGoalAchievedReturn›
│   ├── $achieved: Boolean!
│   ├── adults: JSON
│   ├── error: String
│   ├── field: String
│   ├── goal: JSON
│   ├── hiddenCategories: JSON
│   ├── lastGoal: JSON
│   ├── ratings: JSON
│   ├── review: JSON
│   ├── success: Boolean
│   └── weekStart: String
├── kidsReviewGoalBonus: kidsReviewGoalBonusReturn  ‹IKidsReviewGoalBonusReturn›
│   ├── $id: ID!
│   ├── $points: Int!
│   ├── error: String
│   ├── field: String
│   └── success: Boolean
├── kidsReviewReply: kidsReviewReplyReturn  ‹IKidsReviewReplyReturn›
│   ├── $id: ID!
│   ├── $text: String!
│   ├── error: String
│   ├── field: String
│   └── success: Boolean
├── kidsReviewSave: kidsReviewSaveReturn  ‹IKidsReviewSaveReturn›
│   ├── $values: JSON!
│   ├── adults: JSON
│   ├── error: String
│   ├── field: String
│   ├── goal: JSON
│   ├── hiddenCategories: JSON
│   ├── lastGoal: JSON
│   ├── ratings: JSON
│   ├── review: JSON
│   ├── success: Boolean
│   └── weekStart: String
├── kidsSavingsGoalClose: kidsSavingsGoalCloseReturn  ‹IKidsSavingsGoalCloseReturn›
│   ├── $id: ID!
│   ├── $status: String!
│   ├── account: JSON
│   ├── error: String
│   ├── field: String
│   └── success: Boolean
├── kidsSavingsGoalCreate: kidsSavingsGoalCreateReturn  ‹IKidsSavingsGoalCreateReturn›
│   ├── $kidUserId: ID
│   ├── $values: JSON!
│   ├── account: JSON
│   ├── error: String
│   ├── field: String
│   └── success: Boolean
├── kidsSavingsGoalMove: kidsSavingsGoalMoveReturn  ‹IKidsSavingsGoalMoveReturn›
│   ├── $amountCents: Int!
│   ├── $id: ID!
│   ├── account: JSON
│   ├── error: String
│   ├── field: String
│   └── success: Boolean
├── kidsSchoolSettings: kidsSchoolSettingsReturn  ‹IKidsSchoolSettingsReturn›
│   ├── $kidUserId: ID!
│   ├── $rules: JSON
│   ├── $system: String!
│   ├── canManage: Boolean
│   ├── error: String
│   ├── exams: JSON
│   ├── field: String
│   ├── grades: JSON
│   ├── homework: JSON
│   ├── reports: JSON
│   ├── rules: JSON
│   ├── studies: JSON
│   ├── studyToday: JSON
│   ├── subjects: JSON
│   ├── success: Boolean
│   └── system: String
├── kidsStudyCancel: kidsStudyCancelReturn  ‹IKidsStudyCancelReturn›
│   ├── $id: ID!
│   ├── canManage: Boolean
│   ├── error: String
│   ├── exams: JSON
│   ├── field: String
│   ├── grades: JSON
│   ├── homework: JSON
│   ├── reports: JSON
│   ├── rules: JSON
│   ├── studies: JSON
│   ├── studyToday: JSON
│   ├── subjects: JSON
│   ├── success: Boolean
│   └── system: String
├── kidsStudyStart: kidsStudyStartReturn  ‹IKidsStudyStartReturn›
│   ├── $kidUserId: ID
│   ├── $subjectId: ID
│   ├── canManage: Boolean
│   ├── error: String
│   ├── exams: JSON
│   ├── field: String
│   ├── grades: JSON
│   ├── homework: JSON
│   ├── reports: JSON
│   ├── rules: JSON
│   ├── studies: JSON
│   ├── studyToday: JSON
│   ├── subjects: JSON
│   ├── success: Boolean
│   └── system: String
├── kidsStudyStop: kidsStudyStopReturn  ‹IKidsStudyStopReturn›
│   ├── $id: ID!
│   ├── canManage: Boolean
│   ├── error: String
│   ├── exams: JSON
│   ├── field: String
│   ├── grades: JSON
│   ├── homework: JSON
│   ├── reports: JSON
│   ├── rules: JSON
│   ├── studies: JSON
│   ├── studyToday: JSON
│   ├── subjects: JSON
│   ├── success: Boolean
│   └── system: String
├── kidsSubjectArchive: kidsSubjectArchiveReturn  ‹IKidsSubjectArchiveReturn›
│   ├── $id: ID!
│   ├── canManage: Boolean
│   ├── error: String
│   ├── exams: JSON
│   ├── field: String
│   ├── grades: JSON
│   ├── homework: JSON
│   ├── reports: JSON
│   ├── rules: JSON
│   ├── studies: JSON
│   ├── studyToday: JSON
│   ├── subjects: JSON
│   ├── success: Boolean
│   └── system: String
├── kidsSubjectSave: kidsSubjectSaveReturn  ‹IKidsSubjectSaveReturn›
│   ├── $id: ID
│   ├── $kidUserId: ID
│   ├── $values: JSON!
│   ├── canManage: Boolean
│   ├── error: String
│   ├── exams: JSON
│   ├── field: String
│   ├── grades: JSON
│   ├── homework: JSON
│   ├── reports: JSON
│   ├── rules: JSON
│   ├── studies: JSON
│   ├── studyToday: JSON
│   ├── subjects: JSON
│   ├── success: Boolean
│   └── system: String
├── kidsTaskConfirm: kidsTaskConfirmReturn  ‹IKidsTaskConfirmReturn›
│   ├── $ids: JSON!
│   ├── $points: Int
│   ├── error: String
│   ├── field: String
│   ├── success: Boolean
│   └── tasks: JSON
├── kidsTaskDone: kidsTaskDoneReturn  ‹IKidsTaskDoneReturn›
│   ├── $clientId: String
│   ├── $files: [Upload]
│   ├── $id: ID!
│   ├── error: String
│   ├── field: String
│   ├── success: Boolean
│   └── task: JSON
├── kidsTaskExcuse: kidsTaskExcuseReturn  ‹IKidsTaskExcuseReturn›
│   ├── $id: ID!
│   ├── $reason: String
│   ├── error: String
│   ├── field: String
│   ├── success: Boolean
│   └── task: JSON
├── kidsTaskObject: kidsTaskObjectReturn  ‹IKidsTaskObjectReturn›
│   ├── $id: ID!
│   ├── $text: String!
│   ├── error: String
│   ├── field: String
│   ├── success: Boolean
│   └── task: JSON
├── kidsTaskObjectionDecide: kidsTaskObjectionDecideReturn  ‹IKidsTaskObjectionDecideReturn›
│   ├── $accept: Boolean!
│   ├── $id: ID!
│   ├── error: String
│   ├── field: String
│   ├── success: Boolean
│   └── task: JSON
├── kidsTaskPhoto: kidsTaskPhotoReturn  ‹IKidsTaskPhotoReturn›
│   ├── $files: [Upload]
│   ├── $id: ID!
│   ├── $remove: Boolean
│   ├── error: String
│   ├── field: String
│   ├── success: Boolean
│   └── task: JSON
├── kidsTaskPropose: kidsTaskProposeReturn  ‹IKidsTaskProposeReturn›
│   ├── $files: [Upload]
│   ├── $title: String!
│   ├── error: String
│   ├── field: String
│   ├── success: Boolean
│   └── task: JSON
├── kidsTaskReject: kidsTaskRejectReturn  ‹IKidsTaskRejectReturn›
│   ├── $id: ID!
│   ├── $reason: String
│   ├── error: String
│   ├── field: String
│   ├── success: Boolean
│   └── task: JSON
├── kidsTaskRelease: kidsTaskReleaseReturn  ‹IKidsTaskReleaseReturn›
│   ├── $id: ID!
│   ├── error: String
│   ├── field: String
│   └── success: Boolean
├── kidsTaskReserve: kidsTaskReserveReturn  ‹IKidsTaskReserveReturn›
│   ├── $clientId: String
│   ├── $templateId: ID!
│   ├── error: String
│   ├── field: String
│   ├── success: Boolean
│   └── task: JSON
├── kidsTaskStep: kidsTaskStepReturn  ‹IKidsTaskStepReturn›
│   ├── $done: Boolean!
│   ├── $id: ID!
│   ├── $stepId: String!
│   ├── error: String
│   ├── field: String
│   ├── success: Boolean
│   └── task: JSON
├── kidsTaskUndo: kidsTaskUndoReturn  ‹IKidsTaskUndoReturn›
│   ├── $id: ID!
│   ├── error: String
│   ├── field: String
│   ├── success: Boolean
│   └── task: JSON
├── kidsTemplateDelete: kidsTemplateDeleteReturn  ‹IKidsTemplateDeleteReturn›
│   ├── $id: ID!
│   ├── error: String
│   ├── field: String
│   └── success: Boolean
├── kidsTemplateSave: kidsTemplateSaveReturn  ‹IKidsTemplateSaveReturn›
│   ├── $householdId: ID!
│   ├── $id: ID
│   ├── $values: JSON!
│   ├── error: String
│   ├── field: String
│   ├── success: Boolean
│   └── template: JSON
├── kidsWeekPay: kidsWeekPayReturn  ‹IKidsWeekPayReturn›
│   ├── $method: String!
│   ├── $weekId: ID!
│   ├── error: String
│   ├── field: String
│   ├── success: Boolean
│   └── weeks: JSON
├── kidsWishDelete: kidsWishDeleteReturn  ‹IKidsWishDeleteReturn›
│   ├── $id: ID!
│   ├── error: String
│   ├── field: String
│   └── success: Boolean
├── kidsWishPublicReserve: kidsWishPublicReserveReturn  ‹IKidsWishPublicReserveReturn›
│   ├── $id: ID!
│   ├── $name: String!
│   ├── $percent: Int
│   ├── $token: String!
│   ├── error: String
│   ├── field: String
│   ├── kidName: String
│   ├── success: Boolean
│   └── wishes: JSON
├── kidsWishReceived: kidsWishReceivedReturn  ‹IKidsWishReceivedReturn›
│   ├── $id: ID!
│   ├── $received: Boolean!
│   ├── dates: JSON
│   ├── error: String
│   ├── field: String
│   ├── shareToken: String
│   ├── success: Boolean
│   └── wishes: JSON
├── kidsWishReserve: kidsWishReserveReturn  ‹IKidsWishReserveReturn›
│   ├── $id: ID!
│   ├── $percent: Int
│   ├── dates: JSON
│   ├── error: String
│   ├── field: String
│   ├── shareToken: String
│   ├── success: Boolean
│   └── wishes: JSON
├── kidsWishSave: kidsWishSaveReturn  ‹IKidsWishSaveReturn›
│   ├── $files: [Upload]
│   ├── $id: ID
│   ├── $kidUserId: ID
│   ├── $values: JSON!
│   ├── dates: JSON
│   ├── error: String
│   ├── field: String
│   ├── shareToken: String
│   ├── success: Boolean
│   └── wishes: JSON
├── kidsWishShareCreate: kidsWishShareCreateReturn  ‹IKidsWishShareCreateReturn›
│   ├── $kidUserId: ID!
│   ├── dates: JSON
│   ├── error: String
│   ├── field: String
│   ├── shareToken: String
│   ├── success: Boolean
│   └── wishes: JSON
├── kidsWishShareRevoke: kidsWishShareRevokeReturn  ‹IKidsWishShareRevokeReturn›
│   ├── $kidUserId: ID!
│   ├── dates: JSON
│   ├── error: String
│   ├── field: String
│   ├── shareToken: String
│   ├── success: Boolean
│   └── wishes: JSON
├── kidsWishThanks: kidsWishThanksReturn  ‹IKidsWishThanksReturn›
│   ├── $id: ID!
│   ├── dates: JSON
│   ├── error: String
│   ├── field: String
│   ├── shareToken: String
│   ├── success: Boolean
│   └── wishes: JSON
├── kidsWishToGoal: kidsWishToGoalReturn  ‹IKidsWishToGoalReturn›
│   ├── $id: ID!
│   ├── account: JSON
│   ├── error: String
│   ├── field: String
│   └── success: Boolean
├── linkCreate: linkCreateReturn  ‹ILinkCreateReturn›
│   ├── $json: String!
│   ├── link: String
│   ├── success: Boolean
│   └── token: String
├── linkParse: linkParseReturn  ‹ILinkParseReturn›
│   ├── $token: String!
│   ├── asEmit: Boolean
│   ├── linkId: String
│   ├── params: JSON
│   ├── payload: JSON
│   ├── query: JSON
│   ├── success: Boolean
│   ├── target: String
│   └── view: String
├── myEventsCalendarCreate: myEventsCalendarCreateReturn  ‹IMyEventsCalendarCreateReturn›
│   ├── $values: JSON!
│   ├── calendar: JSON
│   ├── error: String
│   ├── field: String
│   ├── members: JSON
│   └── success: Boolean
├── myEventsCalendarDelete: myEventsCalendarDeleteReturn  ‹IMyEventsCalendarDeleteReturn›
│   ├── $id: ID!
│   ├── error: String
│   ├── field: String
│   └── success: Boolean
├── myEventsCalendarUpdate: myEventsCalendarUpdateReturn  ‹IMyEventsCalendarUpdateReturn›
│   ├── $id: ID!
│   ├── $values: JSON!
│   ├── calendar: JSON
│   ├── error: String
│   ├── field: String
│   ├── members: JSON
│   └── success: Boolean
├── myEventsEventCreate: myEventsEventCreateReturn  ‹IMyEventsEventCreateReturn›
│   ├── $values: JSON!
│   ├── error: String
│   ├── event: JSON
│   ├── field: String
│   └── success: Boolean
├── myEventsEventDelete: myEventsEventDeleteReturn  ‹IMyEventsEventDeleteReturn›
│   ├── $id: ID!
│   ├── $occurrenceStart: String
│   ├── $scope: String
│   ├── error: String
│   ├── field: String
│   └── success: Boolean
├── myEventsEventRestore: myEventsEventRestoreReturn  ‹IMyEventsEventRestoreReturn›
│   ├── $id: ID!
│   ├── error: String
│   ├── event: JSON
│   ├── field: String
│   └── success: Boolean
├── myEventsEventRsvp: myEventsEventRsvpReturn  ‹IMyEventsEventRsvpReturn›
│   ├── $id: ID!
│   ├── $rsvp: String!
│   ├── error: String
│   ├── event: JSON
│   ├── field: String
│   └── success: Boolean
├── myEventsEventUpdate: myEventsEventUpdateReturn  ‹IMyEventsEventUpdateReturn›
│   ├── $id: ID!
│   ├── $occurrenceStart: String
│   ├── $scope: String
│   ├── $values: JSON!
│   ├── error: String
│   ├── event: JSON
│   ├── field: String
│   └── success: Boolean
├── myEventsMemberAccept: myEventsMemberAcceptReturn  ‹IMyEventsMemberAcceptReturn›
│   ├── $calendarId: ID!
│   ├── calendar: JSON
│   ├── error: String
│   ├── field: String
│   ├── members: JSON
│   └── success: Boolean
├── myEventsMemberDecline: myEventsMemberDeclineReturn  ‹IMyEventsMemberDeclineReturn›
│   ├── $calendarId: ID!
│   ├── error: String
│   ├── field: String
│   └── success: Boolean
├── myEventsMemberInvite: myEventsMemberInviteReturn  ‹IMyEventsMemberInviteReturn›
│   ├── $calendarId: ID!
│   ├── $email: Boolean
│   ├── $role: String
│   ├── $userIds: JSON!
│   ├── error: String
│   ├── field: String
│   ├── members: JSON
│   └── success: Boolean
├── myEventsMemberLeave: myEventsMemberLeaveReturn  ‹IMyEventsMemberLeaveReturn›
│   ├── $calendarId: ID!
│   ├── error: String
│   ├── field: String
│   └── success: Boolean
├── myEventsMemberRemove: myEventsMemberRemoveReturn  ‹IMyEventsMemberRemoveReturn›
│   ├── $calendarId: ID!
│   ├── $userId: ID!
│   ├── error: String
│   ├── field: String
│   ├── members: JSON
│   └── success: Boolean
├── myEventsMemberSetRole: myEventsMemberSetRoleReturn  ‹IMyEventsMemberSetRoleReturn›
│   ├── $calendarId: ID!
│   ├── $role: String!
│   ├── $userId: ID!
│   ├── error: String
│   ├── field: String
│   ├── members: JSON
│   └── success: Boolean
├── resumeCreate: resumeCreateReturn  ‹IResumeCreateReturn›
│   ├── $values: JSON!
│   ├── data: JSON
│   └── success: Boolean
├── resumeDelete: resumeDeleteReturn  ‹IResumeDeleteReturn›
│   ├── $id: String!
│   └── success: Boolean
├── resumeImportJson: resumeImportJsonReturn  ‹IResumeImportJsonReturn›
│   ├── $resume: JSON!
│   ├── data: JSON
│   └── success: Boolean
├── resumeUpdate: resumeUpdateReturn  ‹IResumeUpdateReturn›
│   ├── $id: String!
│   ├── $values: JSON!
│   ├── data: JSON
│   └── success: Boolean
├── resumeUpdateContent: resumeUpdateContentReturn  ‹IResumeUpdateContentReturn›
│   ├── $avatarFile: [Upload]
│   ├── $content: JSON!
│   ├── $id: String!
│   ├── data: JSON
│   └── success: Boolean
├── sendMail: sendMailReturn  ‹ISendMailReturn›
│   ├── $context: sendMailContext  ‹ISendMailContext›
│   │   └── content: String
│   ├── $subject: String
│   ├── $template: String!
│   ├── $to: String!
│   └── sent: Boolean
├── statsTrack: statsTrackReturn  ‹IStatsTrackReturn›
│   ├── $data: JSON!
│   ├── error: String
│   ├── field: String
│   └── success: Boolean
├── storageWrite: storageWriteReturn  ‹IStorageWriteReturn›
│   ├── $data: JSON!
│   ├── $key: String!
│   ├── $merge: Boolean
│   ├── $name: String!
│   ├── $overwrite: Boolean
│   ├── $silent: Boolean
│   └── success: Boolean
├── timelineCommentDelete: timelineCommentDeleteReturn  ‹ITimelineCommentDeleteReturn›
│   ├── $commentId: String!
│   └── success: Boolean
├── timelineCommentWrite: timelineCommentWriteReturn  ‹ITimelineCommentWriteReturn›
│   ├── $comment: String!
│   ├── $entryId: String!
│   ├── comment: timelineComment  ‹ITimelineComment›
│   │   ├── canDelete: Boolean
│   │   ├── comment: String
│   │   ├── createdAt: DateTime
│   │   ├── creator: timelineCommentCreator  ‹ITimelineCommentCreator›
│   │   │   ├── alias: String
│   │   │   ├── avatarUrl: String
│   │   │   └── id: String
│   │   ├── entryId: String
│   │   ├── id: String
│   │   ├── isFirst: Boolean
│   │   ├── isLast: Boolean
│   │   ├── payload: JSON
│   │   ├── state: timelineCommentState  ‹ITimelineCommentState›
│   │   │   ├── busy: Boolean
│   │   │   └── deleted: Boolean
│   │   └── userId: String
│   └── success: Boolean
├── timelineCreateEntry: timelineCreateEntryReturn  ‹ITimelineCreateEntryReturn›
│   ├── $allowComments: Boolean!
│   ├── $anonymize: Boolean!
│   ├── $background: String
│   ├── $chart: JSON
│   ├── $choice: JSON
│   ├── $draft: Boolean!
│   ├── $emotionState: JSON
│   ├── $entry: timelineEntryInput!  ‹ITimelineEntryInput›
│   │   ├── category: timelineCategoryInput!  ‹ITimelineCategoryInput›
│   │   │   ├── label: String
│   │   │   └── value: String
│   │   ├── html: String!
│   │   ├── tags: [String]
│   │   └── title: String
│   ├── $entryType: String!
│   ├── $fileDescriptions: JSON
│   ├── $fileFilters: JSON
│   ├── $files: [Upload]
│   ├── $lifeEvent: JSON
│   ├── $location: timelineLocationInput  ‹ITimelineLocationInput›
│   │   ├── lat: String
│   │   ├── lon: String
│   │   ├── name: String
│   │   └── source: String
│   ├── $pageId: ID
│   ├── $public: Boolean!
│   ├── $search: timelineSearchInput  ‹ITimelineSearchInput›
│   │   ├── description: String!
│   │   └── title: String!
│   ├── $story: JSON
│   ├── $version: String
│   ├── $videoTrim: JSON
│   └── success: Boolean
├── timelineDeleteEntry: timelineDeleteEntryReturn  ‹ITimelineDeleteEntryReturn›
│   ├── $entryId: String!
│   └── success: Boolean
├── timelineEntryViewed: timelineEntryViewedReturn  ‹ITimelineEntryViewedReturn›
│   ├── $entryId: ID!
│   ├── success: Boolean
│   └── viewed: Int
├── timelineFixEntries: timelineFixEntriesReturn  ‹ITimelineFixEntriesReturn›
│   ├── $fixName: String!
│   └── success: Boolean
├── timelinePageCreate: timelinePageCreateReturn  ‹ITimelinePageCreateReturn›
│   ├── $bannerFile: [Upload]
│   ├── $values: JSON!
│   ├── entity: JSON
│   └── success: Boolean
├── timelinePageDelete: timelinePageDeleteReturn  ‹ITimelinePageDeleteReturn›
│   ├── $id: ID!
│   ├── deletedEntries: Int
│   └── success: Boolean
├── timelinePageSave: timelinePageSaveReturn  ‹ITimelinePageSaveReturn›
│   ├── $bannerFile: [Upload]
│   ├── $id: ID!
│   ├── $values: JSON!
│   ├── entity: JSON
│   ├── exists: Boolean
│   └── success: Boolean
├── timelinePollVote: timelinePollVoteReturn  ‹ITimelinePollVoteReturn›
│   ├── $entryId: ID!
│   ├── $optionId: String!
│   ├── poll: JSON
│   └── success: Boolean
├── timelineReact: timelineReactReturn  ‹ITimelineReactReturn›
│   ├── $entryId: ID!
│   ├── $value: Int!
│   ├── dislikes: Int
│   ├── likes: Int
│   ├── mine: Int
│   └── success: Boolean
├── timelineUpdateEntry: timelineUpdateEntryReturn  ‹ITimelineUpdateEntryReturn›
│   ├── $entryData: JSON!
│   ├── $entryId: ID!
│   ├── success: Boolean
│   └── updated: JSON
├── timelineUpdateEntryImages: timelineUpdateEntryImagesReturn  ‹ITimelineUpdateEntryImagesReturn›
│   ├── $entryId: ID!
│   ├── $files: [Upload]
│   ├── $images: JSON!
│   ├── images: JSON
│   └── success: Boolean
├── timelineUpdateEntryVideo: timelineUpdateEntryVideoReturn  ‹ITimelineUpdateEntryVideoReturn›
│   ├── $entryId: ID!
│   ├── $files: [Upload]
│   ├── $video: JSON
│   ├── success: Boolean
│   └── video: JSON
├── uploadFile: uploadFileReturn  ‹IUploadFileReturn›
│   ├── $allowedTypes: [String]!
│   ├── $emitAfterUpload: String
│   ├── $file: [Upload]!
│   ├── $immediately: Boolean
│   └── result: uploadResult  ‹IUploadResult›
│       └── uploaded: [uploadResultUploaded]  ‹IUploadResultUploaded›
│           ├── errors: [uploadResultUploadedErrors]  ‹IUploadResultUploadedErrors›
│           │   └── …
│           ├── fileId: String
│           ├── meta: uploadResultUploadedMeta  ‹IUploadResultUploadedMeta›
│           │   └── …
│           └── success: Boolean
├── userConfirm: userConfirmReturn  ‹IUserConfirmReturn›
│   ├── $token: String
│   ├── success: Boolean
│   └── userId: String
├── userCreate: userCreateReturn  ‹IUserCreateReturn›
│   ├── $params: userCreateParams!  ‹IUserCreateParams›
│   │   ├── alias: String!
│   │   ├── email: String!
│   │   └── password: String!
│   ├── success: Boolean
│   └── userId: String
├── userCreateToken: userCreateTokenReturn  ‹IUserCreateTokenReturn›
│   ├── $expiresIn: String
│   ├── $payload: JSON
│   ├── success: Boolean
│   └── token: String
├── userDelete: userDeleteReturn  ‹IUserDeleteReturn›
│   ├── $pwd: String!
│   └── success: Boolean
├── userLogin: userLoginReturn  ‹IUserLoginReturn›
│   ├── $params: userLoginParams!  ‹IUserLoginParams›
│   │   ├── email: String!
│   │   ├── password: String!
│   │   └── userType: String
│   ├── authToken: String
│   ├── meta: userMetaData  ‹IUserMetaData›
│   │   ├── alias: String
│   │   ├── avatarUrl: String
│   │   ├── email: String
│   │   ├── id: String
│   │   ├── lastLogin: DateTime
│   │   ├── role: JSON
│   │   ├── settings: userSettings  ‹IUserSettings›
│   │   │   ├── public: Boolean
│   │   │   ├── searchable: Boolean
│   │   │   ├── showEmail: Boolean
│   │   │   └── showFullName: Boolean
│   │   ├── superUser: Boolean
│   │   ├── teaserUrl: String
│   │   └── userType: String
│   ├── success: Boolean
│   └── userId: String
├── userNotify: userNotifyReturn  ‹IUserNotifyReturn›
│   ├── $actions: JSON
│   ├── $broadcast: String
│   ├── $component: String
│   ├── $flash: Boolean
│   ├── $message: String!
│   ├── $open: Boolean
│   ├── $removable: Boolean
│   ├── $sourceId: ID
│   ├── $targetId: ID
│   ├── $title: String
│   ├── $translate: Boolean
│   ├── $type: String!
│   └── success: Boolean
├── userNotifyClear: userNotifyClearReturn  ‹IUserNotifyClearReturn›
│   ├── $scope: String
│   ├── state: userNotifyClearReturnState  ‹IUserNotifyClearReturnState›
│   │   ├── hasNew: Boolean
│   │   ├── total: Int
│   │   └── unread: Int
│   └── success: Boolean
├── userNotifyDelete: userNotifyDeleteReturn  ‹IUserNotifyDeleteReturn›
│   ├── $notifyId: String!
│   ├── state: userNotifyDeleteReturnState  ‹IUserNotifyDeleteReturnState›
│   │   ├── hasNew: Boolean
│   │   ├── total: Int
│   │   └── unread: Int
│   └── success: Boolean
├── userNotifySeen: userNotifySeenReturn  ‹IUserNotifySeenReturn›
│   ├── $notifyId: String!
│   ├── state: userNotifySeenReturnState  ‹IUserNotifySeenReturnState›
│   │   ├── hasNew: Boolean
│   │   ├── total: Int
│   │   └── unread: Int
│   └── success: Boolean
├── userNotifySeenAll: userNotifySeenAllReturn  ‹IUserNotifySeenAllReturn›
│   ├── $scope: String
│   ├── state: userNotifySeenAllReturnState  ‹IUserNotifySeenAllReturnState›
│   │   ├── hasNew: Boolean
│   │   ├── total: Int
│   │   └── unread: Int
│   └── success: Boolean
├── userPasswordChange: userPasswordChangeReturn  ‹IUserPasswordChangeReturn›
│   ├── $currentPassword: String!
│   ├── $newPassword: String!
│   ├── $userId: String!
│   └── success: Boolean
├── userPasswordCreate: userPasswordCreateReturn  ‹IUserPasswordCreateReturn›
│   ├── $password: String
│   ├── $token: String
│   └── success: Boolean
├── userPasswordReset: userPasswordResetReturn  ‹IUserPasswordResetReturn›
│   ├── $email: String
│   └── success: Boolean
├── userRelationAccept: userRelationAcceptReturn  ‹IUserRelationAcceptReturn›
│   ├── $id: ID!
│   └── success: Boolean
├── userRelationBlock: userRelationBlockReturn  ‹IUserRelationBlockReturn›
│   ├── $sourceId: ID!
│   ├── $targetId: ID!
│   ├── relation: userRelation  ‹IUserRelation›
│   │   ├── blockedBy: String
│   │   ├── id: String
│   │   ├── relationId: String
│   │   ├── requestBy: String
│   │   ├── sourceId: String
│   │   ├── status: String
│   │   └── targetId: String
│   └── success: Boolean
├── userRelationCancel: userRelationCancelReturn  ‹IUserRelationCancelReturn›
│   ├── $id: ID!
│   ├── relation: userRelation  ‹IUserRelation›
│   │   ├── blockedBy: String
│   │   ├── id: String
│   │   ├── relationId: String
│   │   ├── requestBy: String
│   │   ├── sourceId: String
│   │   ├── status: String
│   │   └── targetId: String
│   ├── relationId: String
│   └── success: Boolean
├── userRelationReject: userRelationRejectReturn  ‹IUserRelationRejectReturn›
│   ├── $id: ID!
│   └── success: Boolean
├── userRelationRequest: userRelationRequestReturn  ‹IUserRelationRequestReturn›
│   ├── $targetId: ID!
│   ├── relation: userRelation  ‹IUserRelation›
│   │   ├── blockedBy: String
│   │   ├── id: String
│   │   ├── relationId: String
│   │   ├── requestBy: String
│   │   ├── sourceId: String
│   │   ├── status: String
│   │   └── targetId: String
│   ├── relationId: String
│   └── success: Boolean
├── userRelationUnblock: userRelationUnblockReturn  ‹IUserRelationUnblockReturn›
│   ├── $sourceId: ID!
│   ├── $targetId: ID!
│   ├── relation: userRelation  ‹IUserRelation›
│   │   ├── blockedBy: String
│   │   ├── id: String
│   │   ├── relationId: String
│   │   ├── requestBy: String
│   │   ├── sourceId: String
│   │   ├── status: String
│   │   └── targetId: String
│   └── success: Boolean
├── userResetTeaser: userResetTeaserReturn  ‹IUserResetTeaserReturn›
│   └── success: Boolean
├── userUpdateSettings: userUpdateSettingsReturn  ‹IUserUpdateSettingsReturn›
│   ├── $settings: JSON!
│   └── success: Boolean
├── userUploadAvatar: userUploadAvatarReturn  ‹IUserUploadAvatarReturn›
│   ├── $file: [Upload]!
│   ├── success: Boolean
│   └── url: String
└── userUploadTeaser: userUploadTeaserReturn  ‹IUserUploadTeaserReturn›
    ├── $file: [Upload]!
    ├── success: Boolean
    └── url: String
```

## Inputs

```text
Inputs
├── accountUpdateData  ‹IAccountUpdateData›
│   ├── alias: String!
│   ├── birthday: String
│   ├── description: userDescriptionInput!  ‹IUserDescriptionInput›
│   │   └── html: String!
│   ├── details: userDetailsInput  ‹IUserDetailsInput›
│   │   ├── firstname: String
│   │   └── lastname: String
│   ├── gender: String!
│   ├── id: ID!
│   └── settings: userSettingsInput!  ‹IUserSettingsInput›
│       ├── public: Boolean!
│       ├── searchable: Boolean!
│       ├── showEmail: Boolean!
│       └── showFullName: Boolean!
├── currencyParams  ‹ICurrencyParams›
│   ├── amount: Float
│   ├── base: String!
│   └── symbols: String
├── dbFilter  ‹IDbFilter›
│   ├── field: String!
│   ├── type: dbFilter_enum!  (equals | like)  ‹DbFilterEnum›
│   └── value: String!
├── dbOrder  ‹IDbOrder›
│   ├── field: String!
│   └── type: dbOrder_enum!  (asc | desc)  ‹DbOrderEnum›
├── dbPagination  ‹IDbPagination›
│   ├── limit: Int!
│   └── offset: Int!
├── dbQueryOptions  ‹IDbQueryOptions›
│   ├── filter: [dbFilter]  ‹IDbFilter›
│   │   ├── field: String!
│   │   ├── type: dbFilter_enum!  (equals | like)  ‹DbFilterEnum›
│   │   └── value: String!
│   ├── limit: Int
│   ├── offset: Int
│   └── order: [dbOrder]  ‹IDbOrder›
│       ├── field: String!
│       └── type: dbOrder_enum!  (asc | desc)  ‹DbOrderEnum›
├── findOptions  ‹IFindOptions›
│   ├── orderBy: JSON
│   ├── pagination: pagination  ‹IPagination›
│   │   ├── limit: Int
│   │   └── offset: Int
│   ├── select: JSON
│   └── where: JSON
├── pagination  ‹IPagination›
│   ├── limit: Int
│   └── offset: Int
├── searchOptions  ‹ISearchOptions›
│   ├── limit: Int!
│   └── page: Int!
├── sendMailContext  ‹ISendMailContext›
│   └── content: String
├── timelineCategoryInput  ‹ITimelineCategoryInput›
│   ├── label: String
│   └── value: String
├── timelineEntryInput  ‹ITimelineEntryInput›
│   ├── category: timelineCategoryInput!  ‹ITimelineCategoryInput›
│   │   ├── label: String
│   │   └── value: String
│   ├── html: String!
│   ├── tags: [String]
│   └── title: String
├── timelineListingOptions  ‹ITimelineListingOptions›
│   ├── categories: [String]
│   ├── category: String
│   ├── entryId: String
│   ├── listingId: ID!
│   ├── listingType: String
│   ├── page: Int!
│   ├── pageId: String
│   ├── postId: String
│   ├── type: [String]
│   └── userId: ID
├── timelineLoadEntryOptions  ‹ITimelineLoadEntryOptions›
│   └── entryId: String
├── timelineLocationInput  ‹ITimelineLocationInput›
│   ├── lat: String
│   ├── lon: String
│   ├── name: String
│   └── source: String
├── timelineSearchInput  ‹ITimelineSearchInput›
│   ├── description: String!
│   └── title: String!
├── userCreateParams  ‹IUserCreateParams›
│   ├── alias: String!
│   ├── email: String!
│   └── password: String!
├── userDescriptionInput  ‹IUserDescriptionInput›
│   └── html: String!
├── userDetailsInput  ‹IUserDetailsInput›
│   ├── firstname: String
│   └── lastname: String
├── userLoginParams  ‹IUserLoginParams›
│   ├── email: String!
│   ├── password: String!
│   └── userType: String
└── userSettingsInput  ‹IUserSettingsInput›
    ├── public: Boolean!
    ├── searchable: Boolean!
    ├── showEmail: Boolean!
    └── showFullName: Boolean!
```

## Typen-Index

| GraphQL                                  | Art    | TypeScript                                | Datei        | Beschreibung                                                                     |
| ---------------------------------------- | ------ | ----------------------------------------- | ------------ | -------------------------------------------------------------------------------- |
| `accountSelfDeleteReturn`                | Object | `IAccountSelfDeleteReturn`                | `objects.ts` |                                                                                  |
| `accountSelfLoad`                        | Object | `IAccountSelfLoad`                        | `objects.ts` |                                                                                  |
| `accountSelfUpdateReturn`                | Object | `IAccountSelfUpdateReturn`                | `objects.ts` |                                                                                  |
| `accountSelfUpdateSettingsReturn`        | Object | `IAccountSelfUpdateSettingsReturn`        | `objects.ts` |                                                                                  |
| `accountUpdateData`                      | Input  | `IAccountUpdateData`                      | `inputs.ts`  |                                                                                  |
| `adminAddRoleReturn`                     | Object | `IAdminAddRoleReturn`                     | `objects.ts` |                                                                                  |
| `adminAddUserRoleReturn`                 | Object | `IAdminAddUserRoleReturn`                 | `objects.ts` |                                                                                  |
| `adminPageCreateReturn`                  | Object | `IAdminPageCreateReturn`                  | `objects.ts` |                                                                                  |
| `adminPageDeleteReturn`                  | Object | `IAdminPageDeleteReturn`                  | `objects.ts` |                                                                                  |
| `adminPageGetReturn`                     | Object | `IAdminPageGetReturn`                     | `objects.ts` |                                                                                  |
| `adminPageImageDiscardReturn`            | Object | `IAdminPageImageDiscardReturn`            | `objects.ts` |                                                                                  |
| `adminPageImageKeepReturn`               | Object | `IAdminPageImageKeepReturn`               | `objects.ts` |                                                                                  |
| `adminPageImageUploadReturn`             | Object | `IAdminPageImageUploadReturn`             | `objects.ts` |                                                                                  |
| `adminPageListReturn`                    | Object | `IAdminPageListReturn`                    | `objects.ts` |                                                                                  |
| `adminPageUpdateReturn`                  | Object | `IAdminPageUpdateReturn`                  | `objects.ts` |                                                                                  |
| `adminRoleAddReturn`                     | Object | `IAdminRoleAddReturn`                     | `objects.ts` |                                                                                  |
| `adminRoleListReturn`                    | Object | `IAdminRoleListReturn`                    | `objects.ts` |                                                                                  |
| `adminRoleUpdateReturn`                  | Object | `IAdminRoleUpdateReturn`                  | `objects.ts` |                                                                                  |
| `adminSeoOverviewReturn`                 | Object | `IAdminSeoOverviewReturn`                 | `objects.ts` |                                                                                  |
| `adminSeoRouteDeleteReturn`              | Object | `IAdminSeoRouteDeleteReturn`              | `objects.ts` |                                                                                  |
| `adminSeoRouteSaveReturn`                | Object | `IAdminSeoRouteSaveReturn`                | `objects.ts` |                                                                                  |
| `adminSeoSettingsSaveReturn`             | Object | `IAdminSeoSettingsSaveReturn`             | `objects.ts` |                                                                                  |
| `adminSeoSitemapReturn`                  | Object | `IAdminSeoSitemapReturn`                  | `objects.ts` |                                                                                  |
| `adminStatsGrowthReturn`                 | Object | `IAdminStatsGrowthReturn`                 | `objects.ts` |                                                                                  |
| `adminStatsLiveReturn`                   | Object | `IAdminStatsLiveReturn`                   | `objects.ts` |                                                                                  |
| `adminStatsOverviewReturn`               | Object | `IAdminStatsOverviewReturn`               | `objects.ts` |                                                                                  |
| `adminStatsRemindReturn`                 | Object | `IAdminStatsRemindReturn`                 | `objects.ts` |                                                                                  |
| `adminStatsSecurityReturn`               | Object | `IAdminStatsSecurityReturn`               | `objects.ts` |                                                                                  |
| `adminStatsUserReturn`                   | Object | `IAdminStatsUserReturn`                   | `objects.ts` |                                                                                  |
| `adminStatsVisitorsReturn`               | Object | `IAdminStatsVisitorsReturn`               | `objects.ts` |                                                                                  |
| `adminSystemDeploysReturn`               | Object | `IAdminSystemDeploysReturn`               | `objects.ts` |                                                                                  |
| `adminSystemReleasePlanReturn`           | Object | `IAdminSystemReleasePlanReturn`           | `objects.ts` |                                                                                  |
| `adminSystemStorageReturn`               | Object | `IAdminSystemStorageReturn`               | `objects.ts` |                                                                                  |
| `adminUserGetReturn`                     | Object | `IAdminUserGetReturn`                     | `objects.ts` |                                                                                  |
| `adminUserSearchReturn`                  | Object | `IAdminUserSearchReturn`                  | `objects.ts` |                                                                                  |
| `authAdminBanInfoReturn`                 | Object | `IAuthAdminBanInfoReturn`                 | `objects.ts` |                                                                                  |
| `authAdminBanReturn`                     | Object | `IAuthAdminBanReturn`                     | `objects.ts` |                                                                                  |
| `authAdminUnbanReturn`                   | Object | `IAuthAdminUnbanReturn`                   | `objects.ts` |                                                                                  |
| `authAliasCheckReturn`                   | Object | `IAuthAliasCheckReturn`                   | `objects.ts` |                                                                                  |
| `authCheck`                              | Object | `IAuthCheck`                              | `objects.ts` |                                                                                  |
| `authCodeSendReturn`                     | Object | `IAuthCodeSendReturn`                     | `objects.ts` |                                                                                  |
| `authCodeVerifyReturn`                   | Object | `IAuthCodeVerifyReturn`                   | `objects.ts` |                                                                                  |
| `authDeleteCancelReturn`                 | Object | `IAuthDeleteCancelReturn`                 | `objects.ts` |                                                                                  |
| `authDeleteRequestReturn`                | Object | `IAuthDeleteRequestReturn`                | `objects.ts` |                                                                                  |
| `authEmailChangeReturn`                  | Object | `IAuthEmailChangeReturn`                  | `objects.ts` |                                                                                  |
| `authEmailConfirmReturn`                 | Object | `IAuthEmailConfirmReturn`                 | `objects.ts` |                                                                                  |
| `authExportReturn`                       | Object | `IAuthExportReturn`                       | `objects.ts` |                                                                                  |
| `authIdentifyReturn`                     | Object | `IAuthIdentifyReturn`                     | `objects.ts` |                                                                                  |
| `authInviteInfoReturn`                   | Object | `IAuthInviteInfoReturn`                   | `objects.ts` |                                                                                  |
| `authInviteRenewReturn`                  | Object | `IAuthInviteRenewReturn`                  | `objects.ts` |                                                                                  |
| `authInviteReturn`                       | Object | `IAuthInviteReturn`                       | `objects.ts` |                                                                                  |
| `authPasskeyLoginReturn`                 | Object | `IAuthPasskeyLoginReturn`                 | `objects.ts` |                                                                                  |
| `authPasskeyOptionsReturn`               | Object | `IAuthPasskeyOptionsReturn`               | `objects.ts` |                                                                                  |
| `authPasskeyRegisterOptionsReturn`       | Object | `IAuthPasskeyRegisterOptionsReturn`       | `objects.ts` |                                                                                  |
| `authPasskeyRegisterReturn`              | Object | `IAuthPasskeyRegisterReturn`              | `objects.ts` |                                                                                  |
| `authPasskeyRemoveReturn`                | Object | `IAuthPasskeyRemoveReturn`                | `objects.ts` |                                                                                  |
| `authPasskeyRenameReturn`                | Object | `IAuthPasskeyRenameReturn`                | `objects.ts` |                                                                                  |
| `authPasswordReturn`                     | Object | `IAuthPasswordReturn`                     | `objects.ts` |                                                                                  |
| `authPasswordSetReturn`                  | Object | `IAuthPasswordSetReturn`                  | `objects.ts` |                                                                                  |
| `authRecoveryRenewReturn`                | Object | `IAuthRecoveryRenewReturn`                | `objects.ts` |                                                                                  |
| `authRegisterReturn`                     | Object | `IAuthRegisterReturn`                     | `objects.ts` |                                                                                  |
| `authResetReturn`                        | Object | `IAuthResetReturn`                        | `objects.ts` |                                                                                  |
| `authSecurityReturn`                     | Object | `IAuthSecurityReturn`                     | `objects.ts` |                                                                                  |
| `authSessionRevokeOthersReturn`          | Object | `IAuthSessionRevokeOthersReturn`          | `objects.ts` |                                                                                  |
| `authSessionRevokeReturn`                | Object | `IAuthSessionRevokeReturn`                | `objects.ts` |                                                                                  |
| `authSessionsReturn`                     | Object | `IAuthSessionsReturn`                     | `objects.ts` |                                                                                  |
| `authSudoCodeSendReturn`                 | Object | `IAuthSudoCodeSendReturn`                 | `objects.ts` |                                                                                  |
| `authSudoPasskeyOptionsReturn`           | Object | `IAuthSudoPasskeyOptionsReturn`           | `objects.ts` |                                                                                  |
| `authSudoReturn`                         | Object | `IAuthSudoReturn`                         | `objects.ts` |                                                                                  |
| `authTotpDisableReturn`                  | Object | `IAuthTotpDisableReturn`                  | `objects.ts` |                                                                                  |
| `authTotpEnableReturn`                   | Object | `IAuthTotpEnableReturn`                   | `objects.ts` |                                                                                  |
| `authTotpReturn`                         | Object | `IAuthTotpReturn`                         | `objects.ts` |                                                                                  |
| `authTotpSetupReturn`                    | Object | `IAuthTotpSetupReturn`                    | `objects.ts` |                                                                                  |
| `Boolean`                                | Scalar | –                                         | built-in     | The `Boolean` scalar type represents `true` or `false`.                          |
| `clientReadDataReturn`                   | Object | `IClientReadDataReturn`                   | `objects.ts` |                                                                                  |
| `clientStatusReturn`                     | Object | `IClientStatusReturn`                     | `objects.ts` |                                                                                  |
| `clientUserMata`                         | Object | `IClientUserMata`                         | `objects.ts` |                                                                                  |
| `clientWriteDataReturn`                  | Object | `IClientWriteDataReturn`                  | `objects.ts` |                                                                                  |
| `configImportReturn`                     | Object | `IConfigImportReturn`                     | `objects.ts` |                                                                                  |
| `createAuthTokenReturn`                  | Object | `ICreateAuthTokenReturn`                  | `objects.ts` |                                                                                  |
| `createDummyUsersReturn`                 | Object | `ICreateDummyUsersReturn`                 | `objects.ts` |                                                                                  |
| `cronExecuteReturn`                      | Object | `ICronExecuteReturn`                      | `objects.ts` |                                                                                  |
| `cronJobListReturn`                      | Object | `ICronJobListReturn`                      | `objects.ts` |                                                                                  |
| `cronRunnerListReturn`                   | Object | `ICronRunnerListReturn`                   | `objects.ts` |                                                                                  |
| `currencyGetReturn`                      | Object | `ICurrencyGetReturn`                      | `objects.ts` |                                                                                  |
| `currencyParams`                         | Input  | `ICurrencyParams`                         | `inputs.ts`  |                                                                                  |
| `DateTime`                               | Scalar | `ScalarDateTime`                          | `scalars.ts` |                                                                                  |
| `dbFilter`                               | Input  | `IDbFilter`                               | `inputs.ts`  |                                                                                  |
| `dbFilter_enum`                          | Enum   | `DbFilterEnum`                            | `enums.ts`   |                                                                                  |
| `dbOrder`                                | Input  | `IDbOrder`                                | `inputs.ts`  |                                                                                  |
| `dbOrder_enum`                           | Enum   | `DbOrderEnum`                             | `enums.ts`   |                                                                                  |
| `dbPagination`                           | Input  | `IDbPagination`                           | `inputs.ts`  |                                                                                  |
| `dbQueryOptions`                         | Input  | `IDbQueryOptions`                         | `inputs.ts`  |                                                                                  |
| `dbResourceCreateResult`                 | Object | `IDbResourceCreateResult`                 | `objects.ts` |                                                                                  |
| `dbResourceDeleteResult`                 | Object | `IDbResourceDeleteResult`                 | `objects.ts` |                                                                                  |
| `dbResourceReadResult`                   | Object | `IDbResourceReadResult`                   | `objects.ts` |                                                                                  |
| `dbResourceWriteResult`                  | Object | `IDbResourceWriteResult`                  | `objects.ts` |                                                                                  |
| `deleteAllDummyUsersReturn`              | Object | `IDeleteAllDummyUsersReturn`              | `objects.ts` |                                                                                  |
| `deleteMediaReturn`                      | Object | `IDeleteMediaReturn`                      | `objects.ts` |                                                                                  |
| `developerTestReturn`                    | Object | `IDeveloperTestReturn`                    | `objects.ts` |                                                                                  |
| `developerTestSourceReturn`              | Object | `IDeveloperTestSourceReturn`              | `objects.ts` |                                                                                  |
| `Email`                                  | Scalar | `ScalarEmail`                             | `scalars.ts` |                                                                                  |
| `findOptions`                            | Input  | `IFindOptions`                            | `inputs.ts`  |                                                                                  |
| `Float`                                  | Scalar | –                                         | built-in     | The `Float` scalar type represents signed double-precision fractional values as… |
| `forumCommentCreateReturn`               | Object | `IForumCommentCreateReturn`               | `objects.ts` |                                                                                  |
| `forumCommentDeleteReturn`               | Object | `IForumCommentDeleteReturn`               | `objects.ts` |                                                                                  |
| `forumCommentUpdateReturn`               | Object | `IForumCommentUpdateReturn`               | `objects.ts` |                                                                                  |
| `forumCommunitiesReturn`                 | Object | `IForumCommunitiesReturn`                 | `objects.ts` |                                                                                  |
| `forumCommunityCreateReturn`             | Object | `IForumCommunityCreateReturn`             | `objects.ts` |                                                                                  |
| `forumCommunityJoinReturn`               | Object | `IForumCommunityJoinReturn`               | `objects.ts` |                                                                                  |
| `forumCommunityMembersReturn`            | Object | `IForumCommunityMembersReturn`            | `objects.ts` |                                                                                  |
| `forumCommunityReturn`                   | Object | `IForumCommunityReturn`                   | `objects.ts` |                                                                                  |
| `forumCommunityRoleReturn`               | Object | `IForumCommunityRoleReturn`               | `objects.ts` |                                                                                  |
| `forumCommunityUpdateReturn`             | Object | `IForumCommunityUpdateReturn`             | `objects.ts` |                                                                                  |
| `forumFeedReturn`                        | Object | `IForumFeedReturn`                        | `objects.ts` |                                                                                  |
| `forumPostCreateReturn`                  | Object | `IForumPostCreateReturn`                  | `objects.ts` |                                                                                  |
| `forumPostDeleteReturn`                  | Object | `IForumPostDeleteReturn`                  | `objects.ts` |                                                                                  |
| `forumPostModerateReturn`                | Object | `IForumPostModerateReturn`                | `objects.ts` |                                                                                  |
| `forumPostReturn`                        | Object | `IForumPostReturn`                        | `objects.ts` |                                                                                  |
| `forumPostUpdateReturn`                  | Object | `IForumPostUpdateReturn`                  | `objects.ts` |                                                                                  |
| `forumSearchReturn`                      | Object | `IForumSearchReturn`                      | `objects.ts` |                                                                                  |
| `forumVoteReturn`                        | Object | `IForumVoteReturn`                        | `objects.ts` |                                                                                  |
| `getLocationByCoords`                    | Object | `IGetLocationByCoords`                    | `objects.ts` |                                                                                  |
| `getLocationByCoordsAddress`             | Object | `IGetLocationByCoordsAddress`             | `objects.ts` |                                                                                  |
| `getLocationByIp`                        | Object | `IGetLocationByIp`                        | `objects.ts` |                                                                                  |
| `googleAuthAfterReturn`                  | Object | `IGoogleAuthAfterReturn`                  | `objects.ts` |                                                                                  |
| `holidays`                               | Object | `IHolidays`                               | `objects.ts` |                                                                                  |
| `holidaysItems`                          | Object | `IHolidaysItems`                          | `objects.ts` |                                                                                  |
| `ID`                                     | Scalar | `ScalarID`                                | `scalars.ts` | The `ID` scalar type represents a unique identifier, often used to refetch an o… |
| `Int`                                    | Scalar | –                                         | built-in     | The `Int` scalar type represents non-fractional signed whole numeric values.     |
| `JSON`                                   | Scalar | `ScalarJSON`                              | `scalars.ts` |                                                                                  |
| `kidsAccountAdjustReturn`                | Object | `IKidsAccountAdjustReturn`                | `objects.ts` |                                                                                  |
| `kidsAccountReturn`                      | Object | `IKidsAccountReturn`                      | `objects.ts` |                                                                                  |
| `kidsAccountSettingsReturn`              | Object | `IKidsAccountSettingsReturn`              | `objects.ts` |                                                                                  |
| `kidsComfortDeleteReturn`                | Object | `IKidsComfortDeleteReturn`                | `objects.ts` |                                                                                  |
| `kidsComfortListReturn`                  | Object | `IKidsComfortListReturn`                  | `objects.ts` |                                                                                  |
| `kidsComfortReadReturn`                  | Object | `IKidsComfortReadReturn`                  | `objects.ts` |                                                                                  |
| `kidsComfortReplyReturn`                 | Object | `IKidsComfortReplyReturn`                 | `objects.ts` |                                                                                  |
| `kidsComfortSendReturn`                  | Object | `IKidsComfortSendReturn`                  | `objects.ts` |                                                                                  |
| `kidsConnectAnswerReturn`                | Object | `IKidsConnectAnswerReturn`                | `objects.ts` |                                                                                  |
| `kidsConnectCancelReturn`                | Object | `IKidsConnectCancelReturn`                | `objects.ts` |                                                                                  |
| `kidsConnectDecideReturn`                | Object | `IKidsConnectDecideReturn`                | `objects.ts` |                                                                                  |
| `kidsConnectListReturn`                  | Object | `IKidsConnectListReturn`                  | `objects.ts` |                                                                                  |
| `kidsConnectRequestReturn`               | Object | `IKidsConnectRequestReturn`               | `objects.ts` |                                                                                  |
| `kidsExamAddReturn`                      | Object | `IKidsExamAddReturn`                      | `objects.ts` |                                                                                  |
| `kidsExamDeleteReturn`                   | Object | `IKidsExamDeleteReturn`                   | `objects.ts` |                                                                                  |
| `kidsExportDataReturn`                   | Object | `IKidsExportDataReturn`                   | `objects.ts` |                                                                                  |
| `kidsGradeAddReturn`                     | Object | `IKidsGradeAddReturn`                     | `objects.ts` |                                                                                  |
| `kidsGradeConfirmReturn`                 | Object | `IKidsGradeConfirmReturn`                 | `objects.ts` |                                                                                  |
| `kidsGradeDeleteReturn`                  | Object | `IKidsGradeDeleteReturn`                  | `objects.ts` |                                                                                  |
| `kidsGradeSignReturn`                    | Object | `IKidsGradeSignReturn`                    | `objects.ts` |                                                                                  |
| `kidsHomeworkAddReturn`                  | Object | `IKidsHomeworkAddReturn`                  | `objects.ts` |                                                                                  |
| `kidsHomeworkDeleteReturn`               | Object | `IKidsHomeworkDeleteReturn`               | `objects.ts` |                                                                                  |
| `kidsHouseholdCreateReturn`              | Object | `IKidsHouseholdCreateReturn`              | `objects.ts` |                                                                                  |
| `kidsHouseholdUpdateReturn`              | Object | `IKidsHouseholdUpdateReturn`              | `objects.ts` |                                                                                  |
| `kidsKidAddHouseholdReturn`              | Object | `IKidsKidAddHouseholdReturn`              | `objects.ts` |                                                                                  |
| `kidsKidLoadReturn`                      | Object | `IKidsKidLoadReturn`                      | `objects.ts` |                                                                                  |
| `kidsKidMoneyDecideReturn`               | Object | `IKidsKidMoneyDecideReturn`               | `objects.ts` |                                                                                  |
| `kidsKidMoneyReturn`                     | Object | `IKidsKidMoneyReturn`                     | `objects.ts` |                                                                                  |
| `kidsKidUpdateReturn`                    | Object | `IKidsKidUpdateReturn`                    | `objects.ts` |                                                                                  |
| `kidsLedgerReturn`                       | Object | `IKidsLedgerReturn`                       | `objects.ts` |                                                                                  |
| `kidsLinkUpdateReturn`                   | Object | `IKidsLinkUpdateReturn`                   | `objects.ts` |                                                                                  |
| `kidsListReturn`                         | Object | `IKidsListReturn`                         | `objects.ts` |                                                                                  |
| `kidsMemberAcceptReturn`                 | Object | `IKidsMemberAcceptReturn`                 | `objects.ts` |                                                                                  |
| `kidsMemberDeclineReturn`                | Object | `IKidsMemberDeclineReturn`                | `objects.ts` |                                                                                  |
| `kidsMemberInviteReturn`                 | Object | `IKidsMemberInviteReturn`                 | `objects.ts` |                                                                                  |
| `kidsMemberLeaveReturn`                  | Object | `IKidsMemberLeaveReturn`                  | `objects.ts` |                                                                                  |
| `kidsMemberRemoveReturn`                 | Object | `IKidsMemberRemoveReturn`                 | `objects.ts` |                                                                                  |
| `kidsMoneyRequestDecideReturn`           | Object | `IKidsMoneyRequestDecideReturn`           | `objects.ts` |                                                                                  |
| `kidsMoneyRequestReturn`                 | Object | `IKidsMoneyRequestReturn`                 | `objects.ts` |                                                                                  |
| `kidsOverviewReturn`                     | Object | `IKidsOverviewReturn`                     | `objects.ts` |                                                                                  |
| `kidsPendingReturn`                      | Object | `IKidsPendingReturn`                      | `objects.ts` |                                                                                  |
| `kidsPointsAddReturn`                    | Object | `IKidsPointsAddReturn`                    | `objects.ts` |                                                                                  |
| `kidsPracticeAnswerReturn`               | Object | `IKidsPracticeAnswerReturn`               | `objects.ts` |                                                                                  |
| `kidsPracticeDeleteReturn`               | Object | `IKidsPracticeDeleteReturn`               | `objects.ts` |                                                                                  |
| `kidsPracticeFinishReturn`               | Object | `IKidsPracticeFinishReturn`               | `objects.ts` |                                                                                  |
| `kidsPracticeImageReturn`                | Object | `IKidsPracticeImageReturn`                | `objects.ts` |                                                                                  |
| `kidsPracticeListReturn`                 | Object | `IKidsPracticeListReturn`                 | `objects.ts` |                                                                                  |
| `kidsPracticeReviewReturn`               | Object | `IKidsPracticeReviewReturn`               | `objects.ts` |                                                                                  |
| `kidsPracticeRunReturn`                  | Object | `IKidsPracticeRunReturn`                  | `objects.ts` |                                                                                  |
| `kidsPracticeSaveReturn`                 | Object | `IKidsPracticeSaveReturn`                 | `objects.ts` |                                                                                  |
| `kidsPracticeStartReturn`                | Object | `IKidsPracticeStartReturn`                | `objects.ts` |                                                                                  |
| `kidsPracticeSubmitReturn`               | Object | `IKidsPracticeSubmitReturn`               | `objects.ts` |                                                                                  |
| `kidsRateReturn`                         | Object | `IKidsRateReturn`                         | `objects.ts` |                                                                                  |
| `kidsRatingReplyReturn`                  | Object | `IKidsRatingReplyReturn`                  | `objects.ts` |                                                                                  |
| `kidsRatingsForMeReturn`                 | Object | `IKidsRatingsForMeReturn`                 | `objects.ts` |                                                                                  |
| `kidsReportAddReturn`                    | Object | `IKidsReportAddReturn`                    | `objects.ts` |                                                                                  |
| `kidsReportDeleteReturn`                 | Object | `IKidsReportDeleteReturn`                 | `objects.ts` |                                                                                  |
| `kidsReportUpdateReturn`                 | Object | `IKidsReportUpdateReturn`                 | `objects.ts` |                                                                                  |
| `kidsReviewGoalAchievedReturn`           | Object | `IKidsReviewGoalAchievedReturn`           | `objects.ts` |                                                                                  |
| `kidsReviewGoalBonusReturn`              | Object | `IKidsReviewGoalBonusReturn`              | `objects.ts` |                                                                                  |
| `kidsReviewGoalReturn`                   | Object | `IKidsReviewGoalReturn`                   | `objects.ts` |                                                                                  |
| `kidsReviewListReturn`                   | Object | `IKidsReviewListReturn`                   | `objects.ts` |                                                                                  |
| `kidsReviewReplyReturn`                  | Object | `IKidsReviewReplyReturn`                  | `objects.ts` |                                                                                  |
| `kidsReviewReturn`                       | Object | `IKidsReviewReturn`                       | `objects.ts` |                                                                                  |
| `kidsReviewSaveReturn`                   | Object | `IKidsReviewSaveReturn`                   | `objects.ts` |                                                                                  |
| `kidsSavingsGoalCloseReturn`             | Object | `IKidsSavingsGoalCloseReturn`             | `objects.ts` |                                                                                  |
| `kidsSavingsGoalCreateReturn`            | Object | `IKidsSavingsGoalCreateReturn`            | `objects.ts` |                                                                                  |
| `kidsSavingsGoalMoveReturn`              | Object | `IKidsSavingsGoalMoveReturn`              | `objects.ts` |                                                                                  |
| `kidsSchoolReturn`                       | Object | `IKidsSchoolReturn`                       | `objects.ts` |                                                                                  |
| `kidsSchoolSettingsReturn`               | Object | `IKidsSchoolSettingsReturn`               | `objects.ts` |                                                                                  |
| `kidsStatsReturn`                        | Object | `IKidsStatsReturn`                        | `objects.ts` |                                                                                  |
| `kidsStudyCancelReturn`                  | Object | `IKidsStudyCancelReturn`                  | `objects.ts` |                                                                                  |
| `kidsStudyStartReturn`                   | Object | `IKidsStudyStartReturn`                   | `objects.ts` |                                                                                  |
| `kidsStudyStopReturn`                    | Object | `IKidsStudyStopReturn`                    | `objects.ts` |                                                                                  |
| `kidsSubjectArchiveReturn`               | Object | `IKidsSubjectArchiveReturn`               | `objects.ts` |                                                                                  |
| `kidsSubjectSaveReturn`                  | Object | `IKidsSubjectSaveReturn`                  | `objects.ts` |                                                                                  |
| `kidsTaskConfirmReturn`                  | Object | `IKidsTaskConfirmReturn`                  | `objects.ts` |                                                                                  |
| `kidsTaskDoneReturn`                     | Object | `IKidsTaskDoneReturn`                     | `objects.ts` |                                                                                  |
| `kidsTaskExcuseReturn`                   | Object | `IKidsTaskExcuseReturn`                   | `objects.ts` |                                                                                  |
| `kidsTaskObjectionDecideReturn`          | Object | `IKidsTaskObjectionDecideReturn`          | `objects.ts` |                                                                                  |
| `kidsTaskObjectReturn`                   | Object | `IKidsTaskObjectReturn`                   | `objects.ts` |                                                                                  |
| `kidsTaskPhotoReturn`                    | Object | `IKidsTaskPhotoReturn`                    | `objects.ts` |                                                                                  |
| `kidsTaskProposeReturn`                  | Object | `IKidsTaskProposeReturn`                  | `objects.ts` |                                                                                  |
| `kidsTaskRejectReturn`                   | Object | `IKidsTaskRejectReturn`                   | `objects.ts` |                                                                                  |
| `kidsTaskReleaseReturn`                  | Object | `IKidsTaskReleaseReturn`                  | `objects.ts` |                                                                                  |
| `kidsTaskReserveReturn`                  | Object | `IKidsTaskReserveReturn`                  | `objects.ts` |                                                                                  |
| `kidsTaskStepReturn`                     | Object | `IKidsTaskStepReturn`                     | `objects.ts` |                                                                                  |
| `kidsTaskUndoReturn`                     | Object | `IKidsTaskUndoReturn`                     | `objects.ts` |                                                                                  |
| `kidsTemplateDeleteReturn`               | Object | `IKidsTemplateDeleteReturn`               | `objects.ts` |                                                                                  |
| `kidsTemplateListReturn`                 | Object | `IKidsTemplateListReturn`                 | `objects.ts` |                                                                                  |
| `kidsTemplateSaveReturn`                 | Object | `IKidsTemplateSaveReturn`                 | `objects.ts` |                                                                                  |
| `kidsTodayReturn`                        | Object | `IKidsTodayReturn`                        | `objects.ts` |                                                                                  |
| `kidsUserFindReturn`                     | Object | `IKidsUserFindReturn`                     | `objects.ts` |                                                                                  |
| `kidsWeekListReturn`                     | Object | `IKidsWeekListReturn`                     | `objects.ts` |                                                                                  |
| `kidsWeekPayReturn`                      | Object | `IKidsWeekPayReturn`                      | `objects.ts` |                                                                                  |
| `kidsWishDeleteReturn`                   | Object | `IKidsWishDeleteReturn`                   | `objects.ts` |                                                                                  |
| `kidsWishListReturn`                     | Object | `IKidsWishListReturn`                     | `objects.ts` |                                                                                  |
| `kidsWishPublicReserveReturn`            | Object | `IKidsWishPublicReserveReturn`            | `objects.ts` |                                                                                  |
| `kidsWishPublicReturn`                   | Object | `IKidsWishPublicReturn`                   | `objects.ts` |                                                                                  |
| `kidsWishReceivedReturn`                 | Object | `IKidsWishReceivedReturn`                 | `objects.ts` |                                                                                  |
| `kidsWishReserveReturn`                  | Object | `IKidsWishReserveReturn`                  | `objects.ts` |                                                                                  |
| `kidsWishSaveReturn`                     | Object | `IKidsWishSaveReturn`                     | `objects.ts` |                                                                                  |
| `kidsWishShareCreateReturn`              | Object | `IKidsWishShareCreateReturn`              | `objects.ts` |                                                                                  |
| `kidsWishShareRevokeReturn`              | Object | `IKidsWishShareRevokeReturn`              | `objects.ts` |                                                                                  |
| `kidsWishThanksReturn`                   | Object | `IKidsWishThanksReturn`                   | `objects.ts` |                                                                                  |
| `kidsWishToGoalReturn`                   | Object | `IKidsWishToGoalReturn`                   | `objects.ts` |                                                                                  |
| `linkCreateReturn`                       | Object | `ILinkCreateReturn`                       | `objects.ts` |                                                                                  |
| `linkParseReturn`                        | Object | `ILinkParseReturn`                        | `objects.ts` |                                                                                  |
| `loadNews`                               | Object | `ILoadNews`                               | `objects.ts` |                                                                                  |
| `loadNewsArticles`                       | Object | `ILoadNewsArticles`                       | `objects.ts` |                                                                                  |
| `loadNewsArticlesStreams`                | Object | `ILoadNewsArticlesStreams`                | `objects.ts` |                                                                                  |
| `loadNewsArticlesTags`                   | Object | `ILoadNewsArticlesTags`                   | `objects.ts` |                                                                                  |
| `loadNewsArticlesTeaserImage`            | Object | `ILoadNewsArticlesTeaserImage`            | `objects.ts` |                                                                                  |
| `locationReverseReturn`                  | Object | `ILocationReverseReturn`                  | `objects.ts` |                                                                                  |
| `mailerSendReturn`                       | Object | `IMailerSendReturn`                       | `objects.ts` |                                                                                  |
| `menuOpenReturn`                         | Object | `IMenuOpenReturn`                         | `objects.ts` |                                                                                  |
| `Mutation`                               | Object | `IMutation`                               | `objects.ts` |                                                                                  |
| `myEventsCalendarCreateReturn`           | Object | `IMyEventsCalendarCreateReturn`           | `objects.ts` |                                                                                  |
| `myEventsCalendarDeleteReturn`           | Object | `IMyEventsCalendarDeleteReturn`           | `objects.ts` |                                                                                  |
| `myEventsCalendarListReturn`             | Object | `IMyEventsCalendarListReturn`             | `objects.ts` |                                                                                  |
| `myEventsCalendarLoadReturn`             | Object | `IMyEventsCalendarLoadReturn`             | `objects.ts` |                                                                                  |
| `myEventsCalendarUpdateReturn`           | Object | `IMyEventsCalendarUpdateReturn`           | `objects.ts` |                                                                                  |
| `myEventsEventCreateReturn`              | Object | `IMyEventsEventCreateReturn`              | `objects.ts` |                                                                                  |
| `myEventsEventDeleteReturn`              | Object | `IMyEventsEventDeleteReturn`              | `objects.ts` |                                                                                  |
| `myEventsEventHistoryReturn`             | Object | `IMyEventsEventHistoryReturn`             | `objects.ts` |                                                                                  |
| `myEventsEventListReturn`                | Object | `IMyEventsEventListReturn`                | `objects.ts` |                                                                                  |
| `myEventsEventLoadReturn`                | Object | `IMyEventsEventLoadReturn`                | `objects.ts` |                                                                                  |
| `myEventsEventRestoreReturn`             | Object | `IMyEventsEventRestoreReturn`             | `objects.ts` |                                                                                  |
| `myEventsEventRsvpReturn`                | Object | `IMyEventsEventRsvpReturn`                | `objects.ts` |                                                                                  |
| `myEventsEventTrashReturn`               | Object | `IMyEventsEventTrashReturn`               | `objects.ts` |                                                                                  |
| `myEventsEventUpdateReturn`              | Object | `IMyEventsEventUpdateReturn`              | `objects.ts` |                                                                                  |
| `myEventsMemberAcceptReturn`             | Object | `IMyEventsMemberAcceptReturn`             | `objects.ts` |                                                                                  |
| `myEventsMemberDeclineReturn`            | Object | `IMyEventsMemberDeclineReturn`            | `objects.ts` |                                                                                  |
| `myEventsMemberInviteReturn`             | Object | `IMyEventsMemberInviteReturn`             | `objects.ts` |                                                                                  |
| `myEventsMemberLeaveReturn`              | Object | `IMyEventsMemberLeaveReturn`              | `objects.ts` |                                                                                  |
| `myEventsMemberRemoveReturn`             | Object | `IMyEventsMemberRemoveReturn`             | `objects.ts` |                                                                                  |
| `myEventsMemberSetRoleReturn`            | Object | `IMyEventsMemberSetRoleReturn`            | `objects.ts` |                                                                                  |
| `newsTypes_enum`                         | Enum   | `NewsTypesEnum`                           | `enums.ts`   |                                                                                  |
| `pagination`                             | Input  | `IPagination`                             | `inputs.ts`  |                                                                                  |
| `Password`                               | Scalar | `ScalarPassword`                          | `scalars.ts` |                                                                                  |
| `Query`                                  | Object | `IQuery`                                  | `objects.ts` |                                                                                  |
| `resumeCreateReturn`                     | Object | `IResumeCreateReturn`                     | `objects.ts` |                                                                                  |
| `resumeDeleteReturn`                     | Object | `IResumeDeleteReturn`                     | `objects.ts` |                                                                                  |
| `resumeImportJsonReturn`                 | Object | `IResumeImportJsonReturn`                 | `objects.ts` |                                                                                  |
| `resumeListReturn`                       | Object | `IResumeListReturn`                       | `objects.ts` |                                                                                  |
| `resumeLoadReturn`                       | Object | `IResumeLoadReturn`                       | `objects.ts` |                                                                                  |
| `resumeUpdateContentReturn`              | Object | `IResumeUpdateContentReturn`              | `objects.ts` |                                                                                  |
| `resumeUpdateReturn`                     | Object | `IResumeUpdateReturn`                     | `objects.ts` |                                                                                  |
| `search`                                 | Object | `ISearch`                                 | `objects.ts` |                                                                                  |
| `searchConfig`                           | Object | `ISearchConfig`                           | `objects.ts` |                                                                                  |
| `searchConfigConfig`                     | Object | `ISearchConfigConfig`                     | `objects.ts` |                                                                                  |
| `searchConfigConfigBundles`              | Object | `ISearchConfigConfigBundles`              | `objects.ts` |                                                                                  |
| `searchItems`                            | Object | `ISearchItems`                            | `objects.ts` |                                                                                  |
| `searchItemsRoute`                       | Object | `ISearchItemsRoute`                       | `objects.ts` |                                                                                  |
| `searchOptions`                          | Input  | `ISearchOptions`                          | `inputs.ts`  |                                                                                  |
| `sendMailContext`                        | Input  | `ISendMailContext`                        | `inputs.ts`  |                                                                                  |
| `sendMailReturn`                         | Object | `ISendMailReturn`                         | `objects.ts` |                                                                                  |
| `seoConfigReturn`                        | Object | `ISeoConfigReturn`                        | `objects.ts` |                                                                                  |
| `singleSearch`                           | Object | `ISingleSearch`                           | `objects.ts` |                                                                                  |
| `sitePageGetReturn`                      | Object | `ISitePageGetReturn`                      | `objects.ts` |                                                                                  |
| `sitePageMenuReturn`                     | Object | `ISitePageMenuReturn`                     | `objects.ts` |                                                                                  |
| `statsTrackReturn`                       | Object | `IStatsTrackReturn`                       | `objects.ts` |                                                                                  |
| `storageReadReturn`                      | Object | `IStorageReadReturn`                      | `objects.ts` |                                                                                  |
| `storageWriteReturn`                     | Object | `IStorageWriteReturn`                     | `objects.ts` |                                                                                  |
| `String`                                 | Scalar | –                                         | built-in     | The `String` scalar type represents textual data, represented as UTF-8 characte… |
| `switch_enum`                            | Enum   | `SwitchEnum`                              | `enums.ts`   |                                                                                  |
| `systemVersionReturn`                    | Object | `ISystemVersionReturn`                    | `objects.ts` |                                                                                  |
| `templateRenderReturn`                   | Object | `ITemplateRenderReturn`                   | `objects.ts` |                                                                                  |
| `timelineBestEntriesReturn`              | Object | `ITimelineBestEntriesReturn`              | `objects.ts` |                                                                                  |
| `timelineCategoryInput`                  | Input  | `ITimelineCategoryInput`                  | `inputs.ts`  |                                                                                  |
| `timelineComment`                        | Object | `ITimelineComment`                        | `objects.ts` |                                                                                  |
| `timelineCommentCreator`                 | Object | `ITimelineCommentCreator`                 | `objects.ts` |                                                                                  |
| `timelineCommentDeleteReturn`            | Object | `ITimelineCommentDeleteReturn`            | `objects.ts` |                                                                                  |
| `timelineCommentsListing`                | Object | `ITimelineCommentsListing`                | `objects.ts` |                                                                                  |
| `timelineCommentsListingComments`        | Object | `ITimelineCommentsListingComments`        | `objects.ts` |                                                                                  |
| `timelineCommentsListingCommentsCreator` | Object | `ITimelineCommentsListingCommentsCreator` | `objects.ts` |                                                                                  |
| `timelineCommentsListingCommentsState`   | Object | `ITimelineCommentsListingCommentsState`   | `objects.ts` |                                                                                  |
| `timelineCommentState`                   | Object | `ITimelineCommentState`                   | `objects.ts` |                                                                                  |
| `timelineCommentWriteReturn`             | Object | `ITimelineCommentWriteReturn`             | `objects.ts` |                                                                                  |
| `timelineCreateEntryReturn`              | Object | `ITimelineCreateEntryReturn`              | `objects.ts` |                                                                                  |
| `timelineDeleteEntryReturn`              | Object | `ITimelineDeleteEntryReturn`              | `objects.ts` |                                                                                  |
| `timelineEntryEdit`                      | Object | `ITimelineEntryEdit`                      | `objects.ts` |                                                                                  |
| `timelineEntryInfo`                      | Object | `ITimelineEntryInfo`                      | `objects.ts` |                                                                                  |
| `timelineEntryInfoInfo`                  | Object | `ITimelineEntryInfoInfo`                  | `objects.ts` |                                                                                  |
| `timelineEntryInfoInfoComments`          | Object | `ITimelineEntryInfoInfoComments`          | `objects.ts` |                                                                                  |
| `timelineEntryInput`                     | Input  | `ITimelineEntryInput`                     | `inputs.ts`  |                                                                                  |
| `timelineEntryViewedReturn`              | Object | `ITimelineEntryViewedReturn`              | `objects.ts` |                                                                                  |
| `timelineFixEntriesReturn`               | Object | `ITimelineFixEntriesReturn`               | `objects.ts` |                                                                                  |
| `timelineGlobalStateReturn`              | Object | `ITimelineGlobalStateReturn`              | `objects.ts` |                                                                                  |
| `timelineListing`                        | Object | `ITimelineListing`                        | `objects.ts` |                                                                                  |
| `timelineListingEntries`                 | Object | `ITimelineListingEntries`                 | `objects.ts` |                                                                                  |
| `timelineListingOptions`                 | Input  | `ITimelineListingOptions`                 | `inputs.ts`  |                                                                                  |
| `timelineListingParams`                  | Object | `ITimelineListingParams`                  | `objects.ts` |                                                                                  |
| `timelineLoadConfigReturn`               | Object | `ITimelineLoadConfigReturn`               | `objects.ts` |                                                                                  |
| `timelineLoadEntry`                      | Object | `ITimelineLoadEntry`                      | `objects.ts` |                                                                                  |
| `timelineLoadEntryEntry`                 | Object | `ITimelineLoadEntryEntry`                 | `objects.ts` |                                                                                  |
| `timelineLoadEntryEntryData`             | Object | `ITimelineLoadEntryEntryData`             | `objects.ts` |                                                                                  |
| `timelineLoadEntryEntryDataCategory`     | Object | `ITimelineLoadEntryEntryDataCategory`     | `objects.ts` |                                                                                  |
| `timelineLoadEntryEntryDataCreator`      | Object | `ITimelineLoadEntryEntryDataCreator`      | `objects.ts` |                                                                                  |
| `timelineLoadEntryEntryDataFiles`        | Object | `ITimelineLoadEntryEntryDataFiles`        | `objects.ts` |                                                                                  |
| `timelineLoadEntryEntryDataFilesImages`  | Object | `ITimelineLoadEntryEntryDataFilesImages`  | `objects.ts` |                                                                                  |
| `timelineLoadEntryEntryDataFilesVideos`  | Object | `ITimelineLoadEntryEntryDataFilesVideos`  | `objects.ts` |                                                                                  |
| `timelineLoadEntryEntryDataInfo`         | Object | `ITimelineLoadEntryEntryDataInfo`         | `objects.ts` |                                                                                  |
| `timelineLoadEntryEntryDataInfoComments` | Object | `ITimelineLoadEntryEntryDataInfoComments` | `objects.ts` |                                                                                  |
| `timelineLoadEntryEntryRules`            | Object | `ITimelineLoadEntryEntryRules`            | `objects.ts` |                                                                                  |
| `timelineLoadEntryOptions`               | Input  | `ITimelineLoadEntryOptions`               | `inputs.ts`  |                                                                                  |
| `timelineLoadPostReturn`                 | Object | `ITimelineLoadPostReturn`                 | `objects.ts` |                                                                                  |
| `timelineLocationInput`                  | Input  | `ITimelineLocationInput`                  | `inputs.ts`  |                                                                                  |
| `timelinePageCreateReturn`               | Object | `ITimelinePageCreateReturn`               | `objects.ts` |                                                                                  |
| `timelinePageDeleteReturn`               | Object | `ITimelinePageDeleteReturn`               | `objects.ts` |                                                                                  |
| `timelinePageListReturn`                 | Object | `ITimelinePageListReturn`                 | `objects.ts` |                                                                                  |
| `timelinePageLoadReturn`                 | Object | `ITimelinePageLoadReturn`                 | `objects.ts` |                                                                                  |
| `timelinePageSaveReturn`                 | Object | `ITimelinePageSaveReturn`                 | `objects.ts` |                                                                                  |
| `timelinePollVoteReturn`                 | Object | `ITimelinePollVoteReturn`                 | `objects.ts` |                                                                                  |
| `timelineReactReturn`                    | Object | `ITimelineReactReturn`                    | `objects.ts` |                                                                                  |
| `timelineSearchInput`                    | Input  | `ITimelineSearchInput`                    | `inputs.ts`  |                                                                                  |
| `timelineUpdateEntryImagesReturn`        | Object | `ITimelineUpdateEntryImagesReturn`        | `objects.ts` |                                                                                  |
| `timelineUpdateEntryReturn`              | Object | `ITimelineUpdateEntryReturn`              | `objects.ts` |                                                                                  |
| `timelineUpdateEntryVideoReturn`         | Object | `ITimelineUpdateEntryVideoReturn`         | `objects.ts` |                                                                                  |
| `tokenValidateReturn`                    | Object | `ITokenValidateReturn`                    | `objects.ts` |                                                                                  |
| `Upload`                                 | Scalar | `ScalarUpload`                            | `scalars.ts` | The `Upload` scalar type represents a file upload.                               |
| `uploadFileReturn`                       | Object | `IUploadFileReturn`                       | `objects.ts` |                                                                                  |
| `uploadResult`                           | Object | `IUploadResult`                           | `objects.ts` |                                                                                  |
| `uploadResultUploaded`                   | Object | `IUploadResultUploaded`                   | `objects.ts` |                                                                                  |
| `uploadResultUploadedErrors`             | Object | `IUploadResultUploadedErrors`             | `objects.ts` |                                                                                  |
| `uploadResultUploadedMeta`               | Object | `IUploadResultUploadedMeta`               | `objects.ts` |                                                                                  |
| `userAccount`                            | Object | `IUserAccount`                            | `objects.ts` |                                                                                  |
| `userAliasExists`                        | Object | `IUserAliasExists`                        | `objects.ts` |                                                                                  |
| `userCheckAuth`                          | Object | `IUserCheckAuth`                          | `objects.ts` |                                                                                  |
| `userComparePasswordReturn`              | Object | `IUserComparePasswordReturn`              | `objects.ts` |                                                                                  |
| `userConfirmReturn`                      | Object | `IUserConfirmReturn`                      | `objects.ts` |                                                                                  |
| `userCreateParams`                       | Input  | `IUserCreateParams`                       | `inputs.ts`  |                                                                                  |
| `userCreateReturn`                       | Object | `IUserCreateReturn`                       | `objects.ts` |                                                                                  |
| `userCreateTokenReturn`                  | Object | `IUserCreateTokenReturn`                  | `objects.ts` |                                                                                  |
| `userDeleteReturn`                       | Object | `IUserDeleteReturn`                       | `objects.ts` |                                                                                  |
| `userDescription`                        | Object | `IUserDescription`                        | `objects.ts` |                                                                                  |
| `userDescriptionInput`                   | Input  | `IUserDescriptionInput`                   | `inputs.ts`  |                                                                                  |
| `userDetails`                            | Object | `IUserDetails`                            | `objects.ts` |                                                                                  |
| `userDetailsInput`                       | Input  | `IUserDetailsInput`                       | `inputs.ts`  |                                                                                  |
| `userEmailExists`                        | Object | `IUserEmailExists`                        | `objects.ts` |                                                                                  |
| `userGetById`                            | Object | `IUserGetById`                            | `objects.ts` |                                                                                  |
| `userGetByIdUser`                        | Object | `IUserGetByIdUser`                        | `objects.ts` |                                                                                  |
| `userGetInfo`                            | Object | `IUserGetInfo`                            | `objects.ts` |                                                                                  |
| `userGetInfoInfo`                        | Object | `IUserGetInfoInfo`                        | `objects.ts` |                                                                                  |
| `userGetMeta`                            | Object | `IUserGetMeta`                            | `objects.ts` |                                                                                  |
| `userHasAccessReturn`                    | Object | `IUserHasAccessReturn`                    | `objects.ts` |                                                                                  |
| `userInfoCardReturn`                     | Object | `IUserInfoCardReturn`                     | `objects.ts` |                                                                                  |
| `userInfoListReturn`                     | Object | `IUserInfoListReturn`                     | `objects.ts` |                                                                                  |
| `userList`                               | Object | `IUserList`                               | `objects.ts` |                                                                                  |
| `userListRecords`                        | Object | `IUserListRecords`                        | `objects.ts` |                                                                                  |
| `userLoadConfig`                         | Object | `IUserLoadConfig`                         | `objects.ts` |                                                                                  |
| `userLoginParams`                        | Input  | `IUserLoginParams`                        | `inputs.ts`  |                                                                                  |
| `userLoginReturn`                        | Object | `IUserLoginReturn`                        | `objects.ts` |                                                                                  |
| `userLogout`                             | Object | `IUserLogout`                             | `objects.ts` |                                                                                  |
| `userMediaListing`                       | Object | `IUserMediaListing`                       | `objects.ts` |                                                                                  |
| `userMediaListingRecords`                | Object | `IUserMediaListingRecords`                | `objects.ts` |                                                                                  |
| `userMetaData`                           | Object | `IUserMetaData`                           | `objects.ts` |                                                                                  |
| `userNotifyClearReturn`                  | Object | `IUserNotifyClearReturn`                  | `objects.ts` |                                                                                  |
| `userNotifyClearReturnState`             | Object | `IUserNotifyClearReturnState`             | `objects.ts` |                                                                                  |
| `userNotifyDeleteReturn`                 | Object | `IUserNotifyDeleteReturn`                 | `objects.ts` |                                                                                  |
| `userNotifyDeleteReturnState`            | Object | `IUserNotifyDeleteReturnState`            | `objects.ts` |                                                                                  |
| `userNotifyListing`                      | Object | `IUserNotifyListing`                      | `objects.ts` |                                                                                  |
| `userNotifyListingRecords`               | Object | `IUserNotifyListingRecords`               | `objects.ts` |                                                                                  |
| `userNotifyListingRecordsActions`        | Object | `IUserNotifyListingRecordsActions`        | `objects.ts` |                                                                                  |
| `userNotifyListingRecordsFrom`           | Object | `IUserNotifyListingRecordsFrom`           | `objects.ts` |                                                                                  |
| `userNotifyListingState`                 | Object | `IUserNotifyListingState`                 | `objects.ts` |                                                                                  |
| `userNotifyReturn`                       | Object | `IUserNotifyReturn`                       | `objects.ts` |                                                                                  |
| `userNotifySeenAllReturn`                | Object | `IUserNotifySeenAllReturn`                | `objects.ts` |                                                                                  |
| `userNotifySeenAllReturnState`           | Object | `IUserNotifySeenAllReturnState`           | `objects.ts` |                                                                                  |
| `userNotifySeenReturn`                   | Object | `IUserNotifySeenReturn`                   | `objects.ts` |                                                                                  |
| `userNotifySeenReturnState`              | Object | `IUserNotifySeenReturnState`              | `objects.ts` |                                                                                  |
| `userNotifyState`                        | Object | `IUserNotifyState`                        | `objects.ts` |                                                                                  |
| `userPasswordChangeReturn`               | Object | `IUserPasswordChangeReturn`               | `objects.ts` |                                                                                  |
| `userPasswordCreateReturn`               | Object | `IUserPasswordCreateReturn`               | `objects.ts` |                                                                                  |
| `userPasswordResetReturn`                | Object | `IUserPasswordResetReturn`                | `objects.ts` |                                                                                  |
| `userProfileData`                        | Object | `IUserProfileData`                        | `objects.ts` |                                                                                  |
| `userProfileLoad`                        | Object | `IUserProfileLoad`                        | `objects.ts` |                                                                                  |
| `userProfileParams`                      | Object | `IUserProfileParams`                      | `objects.ts` |                                                                                  |
| `userRelation`                           | Object | `IUserRelation`                           | `objects.ts` |                                                                                  |
| `userRelationAcceptReturn`               | Object | `IUserRelationAcceptReturn`               | `objects.ts` |                                                                                  |
| `userRelationBlockReturn`                | Object | `IUserRelationBlockReturn`                | `objects.ts` |                                                                                  |
| `userRelationCancelReturn`               | Object | `IUserRelationCancelReturn`               | `objects.ts` |                                                                                  |
| `userRelationListReturn`                 | Object | `IUserRelationListReturn`                 | `objects.ts` |                                                                                  |
| `userRelationRejectReturn`               | Object | `IUserRelationRejectReturn`               | `objects.ts` |                                                                                  |
| `userRelationRequestReturn`              | Object | `IUserRelationRequestReturn`              | `objects.ts` |                                                                                  |
| `userRelationStateReturn`                | Object | `IUserRelationStateReturn`                | `objects.ts` |                                                                                  |
| `userRelationUnblockReturn`              | Object | `IUserRelationUnblockReturn`              | `objects.ts` |                                                                                  |
| `userResetTeaserReturn`                  | Object | `IUserResetTeaserReturn`                  | `objects.ts` |                                                                                  |
| `userSettings`                           | Object | `IUserSettings`                           | `objects.ts` |                                                                                  |
| `userSettingsInput`                      | Input  | `IUserSettingsInput`                      | `inputs.ts`  |                                                                                  |
| `userUpdateSettingsReturn`               | Object | `IUserUpdateSettingsReturn`               | `objects.ts` |                                                                                  |
| `userUploadAvatarReturn`                 | Object | `IUserUploadAvatarReturn`                 | `objects.ts` |                                                                                  |
| `userUploadTeaserReturn`                 | Object | `IUserUploadTeaserReturn`                 | `objects.ts` |                                                                                  |
| `yesNo_enum`                             | Enum   | `YesNoEnum`                               | `enums.ts`   |                                                                                  |
