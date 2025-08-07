-- Generated INSERT statements
-- Table: users
-- Total rows: 22
-- Part: 1 of 1
-- Generated at: 2025-08-07T21:26:34.949Z
-- Dialect: POSTGRES
-- Batch size: 1000
-- Data masking: ENABLED

-- PostgreSQL specific settings
SET session_replication_role = replica;
-- Table: users
-- Batch: 1
-- Rows: 22

INSERT INTO "users" ("id", "name", "email", "password", "mobile_no", "profile_image", "country", "city", "role", "createdAt", "updatedAt")
VALUES
  ('f23b8287-0924-4af8-9082-0e859a52c40e', 'surya36'         , 'user531@example.com', '***MASKED***', '766-133-4847', NULL                                             , NULL                              , NULL              , 'user'   , '2025-04-23T08:00:00.175Z', '2025-04-23T08:00:00.182Z'),
  ('99791725-5547-46c8-a060-9f69e91eb210', 'Surya'           , 'user212@example.com', '***MASKED***', '431-840-5878', NULL                                             , NULL                              , NULL              , 'user'   , '2025-08-01T04:17:41.567Z', '2025-05-13T04:17:41.567Z'),
  ('1a86a7b0-eb7f-462a-8279-8ca2792aaecf', 'Katelyn Crawford', 'user583@example.com', '***MASKED***', '987-366-7561', 'https://example.com/images/katelyn_crawford.jpg', 'Norway'                          , 'West Tracey'     , 'Admin'  , '2025-08-01T09:22:16.289Z', '2025-08-01T09:22:16.289Z'),
  ('002f9fa9-f70f-457a-8038-ae62bf4b87c6', 'Felicia Watson'  , 'user260@example.com', '***MASKED***', '253-474-0319', 'https://example.com/images/felicia_watson.jpg'  , 'Angola'                          , 'Salinasfurt'     , 'User'   , '2025-08-01T09:22:16.289Z', '2025-08-01T09:22:16.289Z'),
  ('206992cb-7dd2-47d4-b937-a0843e8694de', 'Faith Wright'    , 'user246@example.com', '***MASKED***', '234-960-3713', 'https://example.com/images/faith_wright.jpg'    , 'Ghana'                           , 'Townsendfurt'    , 'Editor' , '2025-08-01T09:22:16.289Z', '2025-08-01T09:22:16.289Z'),
  ('bf01a6ac-054c-4312-84a8-69f9f23daaa9', 'Katherine Quinn' , 'user103@example.com', '***MASKED***', '385-242-2053', 'https://example.com/images/katherine_quinn.jpg' , 'Costa Rica'                      , 'Fitzgeraldtown'  , 'Editor' , '2025-08-01T09:22:16.289Z', '2025-08-01T09:22:16.289Z'),
  ('e2389d82-38ec-447d-adab-abcd70986b22', 'Patricia Lopez'  , 'user44@example.com' , '***MASKED***', '738-672-0163', 'https://example.com/images/patricia_lopez.jpg'  , 'Chad'                            , 'Lake Alanchester', 'User'   , '2025-08-01T09:22:16.289Z', '2025-08-01T09:22:16.289Z'),
  ('bf953b64-ce27-46f6-b9ce-63fb83d2e051', 'Claudia Scott'   , 'user573@example.com', '***MASKED***', '900-465-2343', 'https://example.com/images/claudia_scott.jpg'   , 'Vietnam'                         , 'New Ronaldburgh' , 'User'   , '2025-08-01T09:22:16.289Z', '2025-08-01T09:22:16.289Z'),
  ('b2916408-78c4-4264-9dba-1efe012bf6e6', 'Debbie Flynn'    , 'user387@example.com', '***MASKED***', '383-198-8519', 'https://example.com/images/debbie_flynn.jpg'    , 'Japan'                           , 'Newmanshire'     , 'Editor' , '2025-08-01T09:22:16.289Z', '2025-08-01T09:22:16.289Z'),
  ('bea25ba7-9c83-43bc-97db-d36e6d4f59f8', 'Summer Pope'     , 'user748@example.com', '***MASKED***', '896-302-0774', 'https://example.com/images/summer_pope.jpg'     , 'Falkland Islands (Malvinas)'     , 'North Sherylberg', 'User'   , '2025-08-01T09:22:16.289Z', '2025-08-01T09:22:16.289Z'),
  ('a6720aba-55c5-44dc-ab85-aab5caed2767', 'Martin Baldwin'  , 'user312@example.com', '***MASKED***', '364-646-3969', 'https://example.com/images/martin_baldwin.jpg'  , 'Sri Lanka'                       , 'Owenshaven'      , 'Editor' , '2025-08-01T09:22:16.289Z', '2025-08-01T09:22:16.289Z'),
  ('5727feb4-fa3a-4069-bcf1-62c8f752df55', 'Andrew Lewis'    , 'user8@example.com'  , '***MASKED***', '915-400-5590', 'https://example.com/images/andrew_lewis.jpg'    , 'Guernsey'                        , 'New Ann'         , 'Manager', '2025-08-01T09:22:16.289Z', '2025-08-01T09:22:16.289Z'),
  ('56b9bd2c-2764-4437-88d2-0c10d9313b09', 'Ralph Palmer'    , 'user364@example.com', '***MASKED***', '206-991-4255', 'https://example.com/images/ralph_palmer.jpg'    , 'Macedonia'                       , 'Port Rebeccaberg', 'User'   , '2025-08-01T09:22:16.289Z', '2025-08-01T09:22:16.289Z'),
  ('5139cbf4-e5bc-4a70-8fd7-6863cda84560', 'Debra Davis'     , 'user961@example.com', '***MASKED***', '763-863-2574', 'https://example.com/images/debra_davis.jpg'     , 'Egypt'                           , 'New John'        , 'Manager', '2025-08-01T09:22:16.289Z', '2025-08-01T09:22:16.289Z'),
  ('41362196-7636-4075-8432-f91ccc0b3a47', 'Wendy Gonzales'  , 'user675@example.com', '***MASKED***', '723-786-4140', 'https://example.com/images/wendy_gonzales.jpg'  , 'Latvia'                          , 'East Rachelland' , 'Manager', '2025-08-01T09:22:16.289Z', '2025-08-01T09:22:16.289Z'),
  ('7cc85631-c267-4e39-a7cd-9aa9e62413f4', 'George Williams' , 'user518@example.com', '***MASKED***', '491-635-3516', 'https://example.com/images/george_williams.jpg' , 'Guadeloupe'                      , 'Thomasfort'      , 'Editor' , '2025-08-01T09:22:16.289Z', '2025-08-01T09:22:16.289Z'),
  ('bfcf2df3-aafc-4375-9255-f38fe3809ace', 'Michael Mitchell', 'user965@example.com', '***MASKED***', '834-203-5519', 'https://example.com/images/michael_mitchell.jpg', 'Finland'                         , 'Port Jane'       , 'Admin'  , '2025-08-01T09:22:16.289Z', '2025-08-01T09:22:16.289Z'),
  ('ee538e4d-b12a-4031-a7e3-b243e9785eb6', 'Bradley Smith'   , 'user404@example.com', '***MASKED***', '293-202-2907', 'https://example.com/images/bradley_smith.jpg'   , 'Mongolia'                        , 'Andersonview'    , 'Admin'  , '2025-08-01T09:22:16.289Z', '2025-08-01T09:22:16.289Z'),
  ('056aceb8-727e-445b-a188-f9f33cedee09', 'Joshua Mendoza'  , 'user823@example.com', '***MASKED***', '109-589-1155', 'https://example.com/images/joshua_mendoza.jpg'  , 'Brunei Darussalam'               , 'Tammymouth'      , 'User'   , '2025-08-01T09:22:16.289Z', '2025-08-01T09:22:16.289Z'),
  ('85db4458-4d3d-4c53-a40a-14a4d6168c8d', 'Paula Atkinson'  , 'user447@example.com', '***MASKED***', '267-987-3305', 'https://example.com/images/paula_atkinson.jpg'  , 'Saint Vincent and the Grenadines', 'East Rodney'     , 'User'   , '2025-08-01T09:22:16.289Z', '2025-08-01T09:22:16.289Z'),
  ('57c0ef78-cf43-4411-9093-72e244ed7711', 'Evelyn Flores'   , 'user883@example.com', '***MASKED***', '407-428-8582', 'https://example.com/images/evelyn_flores.jpg'   , 'Jamaica'                         , 'Michaelstad'     , 'Admin'  , '2025-08-01T09:22:16.289Z', '2025-08-01T09:22:16.289Z'),
  ('f585377e-8ed8-45f0-a6f5-b76b96a1070f', 'April Sullivan'  , 'user980@example.com', '***MASKED***', '872-462-6608', 'https://example.com/images/april_sullivan.jpg'  , 'Russian Federation'              , 'Lake Donna'      , 'User'   , '2025-08-01T09:22:16.289Z', '2025-08-01T09:22:16.289Z')
;
