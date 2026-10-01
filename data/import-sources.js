// Friends who upload their own BGStats export from their profile, and how
// the people and places in their app are called here. Keys are their app's
// BGStats ids, which stay the same when they rename someone in their app.
// Agreed with Στιβ in the "Dimitris import - players and places" sheet,
// 30 Sep 2026. Anyone new in a later export is asked about when it's uploaded.
const IMPORT_SOURCES = {
  'Δημητρης': {
    bgg: 'rhogarj',          // the export's BGG username: only his files are accepted
    skipWith: ['Στιβ'],      // plays Στιβ is in are skipped: his own copy is kept
    // ...except these: plays with Στιβ that Στιβ never logged (not even as another
    // edition, within two days). Found and brought in on 2 Oct 2026.
    importAnyway: [
      '24067c67-e617-470b-be2b-3ce9a20e299c',   // 2023-04-11 Frosthaven
      'a94b662c-d9ce-4e69-8e56-cef9628adbcc',   // 2023-07-14 Imperial Settlers: Empires of the North
      '1fc577c9-bb61-4633-9ebb-3b50981d8e91',   // 2023-10-14 So Clover!
      'ebbf06d1-66bb-4f1f-9092-6097fd3e1556',   // 2023-10-14 So Clover!
      '62ce7cd0-94f5-4fbd-9338-b79755428856',   // 2023-10-14 Horrified: American Monsters
      '460fe555-2d78-485f-9042-a63921c1f15c',   // 2024-02-12 Horrified: American Monsters
      '2faaaae9-e906-439b-9eec-8759753494fb',   // 2024-02-13 Azul
      'fead94c1-98f4-4050-ba53-06c2222886ba',   // 2024-02-13 Azul
      '5ab9e1ea-b7bc-4365-8944-ab3a3059f35a',   // 2024-02-18 Paleo
      '31726638-de12-4ad8-875a-776bba1a50eb',   // 2024-03-03 Clank!: Catacombs
      '137898b4-dc4c-4115-963a-ac0539790fd1',   // 2024-04-04 Paint the Roses
      'c5835c08-d833-4b1f-a031-0193c49fd2ec',   // 2024-06-27 Detective: City of Angels
      'd3047421-0352-4622-9fd6-43be2c20f237',   // 2024-06-27 Detective: City of Angels
      '573d6dee-dc56-44ec-b51f-8a0db06ce544',   // 2024-06-29 Etherfields
      '71aa4565-59df-4eda-ab52-5dd9bbcadcfa',   // 2024-06-29 Etherfields
      'ccacbac2-8e1e-405b-87c7-c009e97d55d1',   // 2024-06-29 Etherfields
      'e633945a-0de6-4c5a-aafc-df437ac046d9',   // 2024-06-29 Etherfields
      'ed1d2c4e-45d4-4054-a9ce-1c1376e3e754',   // 2024-07-09 Etherfields
      '1e05cf36-ec83-408c-bf05-4e21fa3d2a17',   // 2024-07-23 Spirit Island
      'ee1c13a7-fdb5-4044-bc70-88770c615ada',   // 2024-09-12 The 7th Citadel
      'a4ae140d-79ae-4cab-b4ef-627f7cb29d7c',   // 2024-09-13 The 7th Citadel
      '34d014c8-35a4-40c9-8cd9-052862d54340',   // 2025-02-25 Paint the Roses
      '81afa740-e19a-442f-93c6-942bf251222e',   // 2025-03-18 Too Many Bones
      '1441d43e-0bf3-460d-9eeb-296db35cced2',   // 2025-03-27 Sleeping Gods: Distant Skies
      '939cd3d4-0fff-4c0d-b17e-dbf0d111b72d',   // 2025-06-04 Thunder Road: Vendetta
      'b13c8d62-ea1d-4ed7-a14e-ea1d7b2cc154',   // 2025-06-04 Thunder Road: Vendetta
      '5669ece4-49fd-4ed0-a40a-1c7063ebe909',   // 2025-11-11 Oathsworn: Into the Deepwood
    ],
    players: {
      "6d27defa-7ca2-4b43-a523-20559caed87e": "Αγγελος - BS",   // Aggelos Bgg Hardcore
      "b6e0b7e7-6ede-4429-8af0-26447466c844": "Αγγελος NL",   // Aggelos NL
      "1b79a67d-b0f7-4e6a-822d-dea44bd4b8a4": "Game 🤖",   // AI Robot Player
      "ce01045c-4beb-4a7e-8f4d-fa4ae7f55317": "Αλεξ - φιλος Παυλου",   // Alex Filos Pavlou
      "ecbb7a53-7664-4f60-97da-497bd7c7236e": "Αναστασια",   // Anastasia
      "7f340497-aad0-42f0-a560-d6fbf03ef7dd": "Anonymous player",   // Anonymous player
      "beb545dc-baf4-4c0e-b066-29bf64838796": "Αντωνης Τσαγκαρακης",   // Antonis - Gianni's Friend
      "ae6c40d6-1b0f-4b86-994e-f09bcc0c0f4f": "Αποστολης",   // Apostolis - Giannis Bf
      "dcbcfc78-0aab-425a-83a7-9a7ef0f6a5d7": "Bill",   // Bill
      "e4c62df4-6dd7-4862-9eaa-3e82e3f48078": "Μπαμπας Δημητρη",   // Dad
      "8ce9bcf3-b9a3-4384-9a38-9c8ebd47f0fc": "Δημητρης Σελιτσιανος",   // Dimitris Sel
      "a68fc389-f77a-4211-acb2-1f69ec94c915": "Ερρικος - φιλος Μακη",   // Errikos Filos Maki Xirogianni
      "aec62c14-247d-4d85-a222-879d15845d88": "Φωκιωνας",   // Fokionas
      "bbb4f2d9-23a4-40c7-a409-a8b3c425e712": "Gab - φιλος Παυλου",   // Gab Filos Pavlou
      "f058fc03-b6be-48bf-9cfa-030e7fb6c240": "Γεωργια - κοπελα Φωκιωνα",   // Georgia Fokos Gf
      "19932c10-814b-4d2d-bf53-2614927df59b": "Γιαννης Αγγουριδακης",   // Giannis A
      "0660ef29-4fd1-47fb-8942-0a8144812bb7": "Γιαννης Φωτοπουλος",   // Giannis Fot
      "dc3603c5-3721-4ff7-aa24-9f47e535420a": "Γιαννης Σμυρλιαδης - BS",   // Giannis Simigliadhs Bgg Hardcore
      "93d27640-83c4-41f5-b6cb-157f12d37b6e": "Στιβ",   // Giannis Stiv
      "673ff69a-3603-4c1b-8a5b-e9e1c66e2a27": "Γιωργος Γεωργιαδης",   // Giorgos
      "47ec9800-b0ca-423f-a369-0a81a0bf9add": "Γιωργος Καραμαλης",   // Giorgos Karamalis
      "f5a10d51-efa6-4661-bc57-76d0b9e37c17": "Γιωργος Τσερβενης",   // Giorgos Tservenis
      "1db7ff00-2e8e-4283-b74f-724bd018ac95": "LGeorge",   // Giwrgos Apo Bgg Hardcore
      "5b6f3c2a-97f0-4e6e-963a-10bbde7530d7": "LGeorge",   // Giwrgos Filos Gianni
      "9655e59b-73ae-4449-b4be-0c390f664d30": "Ηλιας - BS",   // Ilias Bg South
      "4aa33846-24f6-4b49-b6db-cd7f77172ca3": "Ηλιας - φιλος Μακη",   // Ilias Filos Maki Xirogianni
      "c52fe6b5-e28f-452a-b51c-af13da514047": "Javi",   // Javi
      "3258cce6-9010-4ed1-a12b-518ac5e26054": "Κωνσταντινα",   // Konstantina
      "b844ff89-3e78-42d5-8696-89ee0ec9f8b8": "Κωστας Δημοπουλος",   // Kostas Dimopoulos
      "b871303e-1951-4299-b350-085bf802dca9": "Κωστας Ρεταλης",   // Kostas Filos Gianni
      "5202af12-4dc7-4498-8935-3379893b68ba": "Κωστας Ρεταλης",   // Kostas Retalis
      "67e83d49-d1ad-46bb-92cb-f61a3c84c59c": "Λευτερης",   // Leyteris
      "5e9e04b3-c4d4-4fe5-92e6-1ecf57942be6": "Μακης Ξηρογιαννης",   // Makis Xirogiannis
      "5bf1656b-b7eb-4037-8ceb-1d13362d44f0": "Μανος - φιλος Οδυσσεα",   // Manos Filos Odyssea
      "2230df22-11ee-4775-a92b-e7891e46360d": "Δημητρης",   // Me
      "d06cd993-3cce-40de-be92-1279598b6ebf": "Μαμα Δημητρη",   // Mom
      "6457d12a-b4ec-403e-a725-740cf7a964cb": "Νικολας - φιλος Οδυσσεα",   // Nikolas Filos Odyssea
      "143c4734-6ef0-472b-a5d6-d3953670279c": "Νικολεττα",   // Nikoletta
      "a3a8710c-72cd-41b4-8a05-86a45b5b5b55": "Νικος Παπακης - BS",   // Nikos Bgg Hardcore
      "fd1b65fb-31bd-4e6b-98eb-beb3bf69d6fe": "Οδυσσεας Ηλιοπουλος",   // Odysseas Filos Maki
      "e538637c-cd1c-4268-a8fa-e3f4493df69c": "Οδυσσεας Μουμτζακης",   // Odysseas Moumtzakis
      "2563b1f8-f3c3-4474-af91-4cbf59d6299c": "Τσαπ",   // Panagiotis Tsap
      "b50c9a26-dbd3-428e-b17b-4441e8c0445f": "Πανος",   // Panos
      "1ac84594-1b61-44d2-9167-72dbce0498e1": "Παντελης - φιλος Οδυσσεα",   // Pantelis Filos Odyssea
      "d98b3375-4644-4ca4-91af-85cb6fb361a4": "Παυλος Σακελλαριδης",   // Pavlos
      "2e7c29f6-a64c-4d85-8bdc-33178daa3fd8": "Πετρος - φιλος Μακη",   // Petros Filos Maki
      "7cd76791-4d6f-4487-9fd9-85c67d8b7825": "Game 🤖",   // Sam (Great Western Trail Bot)
      "a35e79bb-16a0-4600-bb8c-c00732843cc8": "Σωτηρης - Argo",   // Sotiris Filos Stayrou
      "69c70155-642f-46ec-b160-445cc7ddce6c": "Σπυρος - BS",   // Spyros Bgg
      "9fe58a12-1658-4f7d-89e8-1538410f2992": "Στάθης",   // Stathis
      "fec8731f-4698-4df4-9500-7884bde4cafa": "Σταυρος - Argo",   // Stavros
      "e405d33e-2347-48a0-aa4f-888a41fc0153": "Στεφανος Σαριδακης",   // Stefanos Filos Giannis
      "aac0b3d9-5efe-4b0c-895e-7578991adeb4": "Στελλα",   // Stella Giorgos Gf
      "81d9afa5-ad31-4183-8620-b5931c96044e": "Θανασης youtuber",   // Thanassis Apo Giorgo BGG
      "dbf473a8-0bc6-4e17-ab75-b802f28a8be1": "Θανος",   // Thanos
      "cd5cf04d-10ad-47f1-8a78-02ce17c14c52": "Θανος",   // Thanos Filos Gianni
      "ec260b0b-5d13-4e18-84fd-00e9b8143203": "Θοδωρης - φιλος Μακη",   // Thodoris Filos Maki Xirogianni
      "5490d2d2-ae8f-4f71-8c92-53297c24167f": "Θειος Γρηγορης",   // Uncle Greg
      "e6d45b31-9677-4d4e-ad09-e144ba3ef1eb": "Βαγγελης - Argo",   // Vaggelis
      "ce3e549b-f672-48fe-8081-0bea1cc13fa9": "Vaggelis - BS",   // Vaggelis Bgg Hardcore
      "049c8270-1dd5-41cb-9c67-dea7bf04e6a7": "Βαγγελης Καραφανταλος",   // Vaggelis Karafantalos
      "3c286bec-42d2-4d3e-beb7-837e65a93b01": "Βαλαντης - Argo",   // Valantis
      "0f66f2c0-50ad-4f9e-adb7-85d5450116a5": "Βυρινης",   // Virinis
      "940144fc-e4f7-4d67-8568-75d1b30cc756": "Βλασης - Argo",   // Vlassis
      "f2b79cea-d2a1-4d2e-bf1c-b5a8ceffdab3": "Μαντσος",   // Xrhstos Mantsos
      "4cd1720f-336f-4c23-beee-9a82f1ab7dd4": "Αλεξανδρος - Argo",   // Αλέξανδρος Φίλος Δημήτρη Σελ
    },
    places: {
      "e62c01fb-12b7-4857-8288-a7c977447fc7": "Acapus Coffee",   // Acapus Coffee
      "439e5be7-be06-4863-a782-e7263d969d10": "Argo Tabletop Camp",   // Argo 6th Tabletop Camp
      "df99a584-6a9b-4acb-9f9a-abcccf9ff8c7": "Argo Tabletop Camp",   // Argo 7th Tabletop Camp
      "3acdbaf9-c357-4379-85c3-6381d63cee6d": "Argo Tabletop Camp",   // Argo Fifth Tabletop Camp
      "36a7d5c4-2d85-4a6c-bcd7-7ec4635489b8": "Argo Tabletop Camp",   // Argo Fourth Tabletop Camp
      "a0537151-7c6d-49f3-aeab-67fd233efa53": "Argo Tabletop Camp",   // Argo Third Tabletop Camp
      "a2ae4d40-cf2b-4cec-8e17-ef90b9f49c31": "Argo Tabletop Camp",   // Argonauts 8th Board Game Camp
      "92f3ce2d-7ee9-4902-985a-46833c6b12bb": "Argo Tabletop Camp",   // Argonauts 9th Tabletop Camp
      "41a24ab2-30bb-4d41-845a-1cbe81f7dd71": "Bill's Home",   // Bill's House
      "dc393093-a526-4641-8d0a-603ee10b6226": "Dragonphoenix Inn",   // Dragonphoenix Inn
      "c9ed769b-7337-409d-83b5-7219e74d2a55": "Fokionas' Home",   // Fokos House
      "ef2adb19-f6d2-4eeb-bf0e-a4a4be3fc7ac": "Foreign Country",   // Foreign Country
      "e3957f63-9ba2-4c76-a200-2366f0bb0f25": "Stiv's Home",   // Giannis' House
      "fcd519f4-9a6a-40b5-9f78-0edd2fee1f95": "Karamalis' Home",   // Giorgos Karamalis's House
      "cad18df8-a85b-4597-8185-a32156f9c06d": "Tservenis' Home",   // Giorgos Tservenis' House
      "56117c9f-e33c-4db0-b68e-8f2454677864": "Board South",   // Giwrgos' House
      "add14966-f7df-43a9-887d-ee871f050b02": "Makis' Home",   // Makis Xirogiannis' House
      "fa76bef1-0b70-42b2-9793-7f040045a4d0": "Foreign Country",   // Malta
      "63d10007-1f5a-44c5-bae2-bca21e316da4": "Dimitri's Home",   // My House 
      "957a7e98-a81a-4d91-93d2-12d2104eb739": "Nikoletta's Home",   // Nikolettas
      "1d3e7750-144c-4450-be0f-8fc3cc242f0a": "Odysseas' Home",   // Odysseas' House
      "d20b621d-dfca-436a-8537-7ea9f2bd9260": "Chap",   // Panagiotis Tsap's House
      "4d48cad6-5bb3-402c-a050-33c421832834": "Dimitri's Old Home",   // Parents House
      "a91445ff-8e0c-4abe-9c9a-cbe52801be2d": "The Playce",   // Playce Panormou
      "7239ca45-05a6-465d-ad6f-596c8683e2fb": "Saronic Ferries Poros",   // Saronic Ferries Poros
      "cc041ca5-efdb-4fdd-9f9f-e96ce526d855": "Tabletop Simulator",   // Tts
      "4aac761f-751c-4a24-ad21-d05029ffac63": "Untap.In",   // Untap.In
      "d2ad1ff4-c735-48f7-b30d-4d34346b8112": "Xylokastro",   // Xylokastro
    },
  },
};
