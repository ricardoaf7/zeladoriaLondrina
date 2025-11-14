-- LOTE 1: Primeiras 50 linhas do CSV
-- Execute este SQL no Supabase

-- Primeiro, criar a função de correção se ainda não existir
CREATE OR REPLACE FUNCTION corrigir_texto(texto TEXT)
RETURNS TEXT AS $$
BEGIN
    IF texto IS NULL THEN
        RETURN texto;
    END IF;
    
    -- Substituir caracteres com problemas comuns
    texto := REPLACE(texto, 'Ã§', 'ç');
    texto := REPLACE(texto, 'Ã£', 'ã');
    texto := REPLACE(texto, 'Ã³', 'ó');
    texto := REPLACE(texto, 'Ã©', 'é');
    texto := REPLACE(texto, 'Ã', 'í');
    texto := REPLACE(texto, 'Ã¢', 'â');
    texto := REPLACE(texto, 'Ã´', 'ô');
    texto := REPLACE(texto, 'Ãª', 'ê');
    texto := REPLACE(texto, 'Ã¹', 'ú');
    texto := REPLACE(texto, 'Ã¼', 'ü');
    texto := REPLACE(texto, 'Ã±', 'ñ');
    texto := REPLACE(texto, 'Ã¡', 'á');
    texto := REPLACE(texto, 'Ã ', 'à');
    texto := REPLACE(texto, 'Âº', 'º');
    texto := REPLACE(texto, 'Âª', 'ª');
    texto := REPLACE(texto, 'Ã‰', 'É');
    texto := REPLACE(texto, 'Ã“', 'Ó');
    texto := REPLACE(texto, 'Ã', 'Í');
    
    RETURN texto;
END;
$$ LANGUAGE plpgsql;

-- Inserir os dados do lote 1
INSERT INTO service_areas (
    id, ordem, sequencia_cadastro, tipo, endereco, bairro, metragem_m2, 
    lat, lng, lote, status, history, polygon, scheduled_date, 
    proxima_previsao, ultima_rocagem, manual_schedule, days_to_complete, 
    servico, registrado_por, data_registro, created_at, updated_at
) VALUES 
-- Linhas 1-50 (com correção de caracteres e histórico mantido)
(16, NULL, NULL, 'Roçagem', corrigir_texto('icós'), corrigir_texto('são caetano'), 438.56, -23.3014941, -51.1550653, 1, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(17, NULL, NULL, 'Roçagem', corrigir_texto('tembés'), corrigir_texto('portuguesa'), 348, -23.3023949, -51.154633, 1, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(18, NULL, NULL, 'Roçagem', corrigir_texto('tiete c john kennedy'), corrigir_texto('recreio'), 1915.41, -23.2953414, -51.1589755, 1, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(635, NULL, NULL, 'Roçagem', corrigir_texto('rua gustavo barroso c/ av. tiradentes'), corrigir_texto('shangri - la a'), 6371.05, -23.3013172, -51.1774531, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(19, NULL, NULL, 'Roçagem', corrigir_texto('tietê c duque de caxias 2 praças'), corrigir_texto('recreio'), 2457, -23.3272806, -51.1540579, 1, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(637, NULL, NULL, 'Roçagem', corrigir_texto('porto alegre em frente ao nº 120'), corrigir_texto('vila agari'), 170.01, -30.0368176, -51.2089887, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(641, NULL, NULL, 'Roçagem', corrigir_texto('trav. farroupilha / rua castro alves'), corrigir_texto('shangri - la a'), 6358.13, -23.2990914, -51.1860962, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(657, NULL, NULL, 'Roçagem', corrigir_texto('mercurio c/ marte / capricornio'), corrigir_texto('do sol'), 1825.27, -23.2740063, -51.1861348, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(664, NULL, NULL, 'Roçagem', corrigir_texto('rua sergio cardoso quadra 18a lotes 08, 09 e 10'), corrigir_texto('são francisco de assis'), 1303.16, -23.3197305, -51.1662008, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(676, NULL, NULL, 'Roçagem', corrigir_texto('serra dos pirineus c/ serra do monte carlo'), corrigir_texto('bandeirantes'), 3428.35, -23.2974051, -51.2014976, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(643, NULL, NULL, 'Roçagem', corrigir_texto('leste oeste c/ luiz delfino'), corrigir_texto('shangri - la a'), 2246.88, -23.2977069, -51.1897832, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(589, NULL, NULL, 'Roçagem', corrigir_texto('rua mato grosso c/ av. arc. dom geraldo fernandes - pai'), corrigir_texto('centro'), 1973.45, -23.3005648, -51.2241743, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(592, NULL, NULL, 'Roçagem', corrigir_texto('rua sen. souza naves c/ rua piaui (concha)'), corrigir_texto('centro'), 722.72, -23.3130619, -51.1575552, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(606, NULL, NULL, 'Roçagem', corrigir_texto('av. higienópolis c/ rua valparaiso / rua santiago'), corrigir_texto('guanabara'), 1869.2, -23.3105478, -51.1658269, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(616, NULL, NULL, 'Roçagem', corrigir_texto('rua guarujá c/ rua flórida'), corrigir_texto('jd. flórida'), 140.76, -23.3276614, -51.1519421, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(624, NULL, NULL, 'Roçagem', corrigir_texto('rua urbano duarte c/ rua libero badaro'), corrigir_texto('nova londres'), 5300.47, -23.3320085, -51.1557352, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(11, NULL, NULL, 'Roçagem', corrigir_texto('rua tupiniquins (duas laterais)'), corrigir_texto('casoni'), 150, -23.3028976, -51.1494082, 1, 'Pendente', '[]', NULL, '2025-12-18', NULL, '2025-11-03', false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(13, NULL, NULL, 'Roçagem', corrigir_texto('jorge casoni c/ camacan e alexandre albertoni (2 areas)'), corrigir_texto('kase'), 722.44, -23.2949574, -51.1471296, 1, 'Pendente', '[]', NULL, '2025-12-18', NULL, '2025-11-03', false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(15, NULL, NULL, 'Roçagem', corrigir_texto('vital brasil c oswaldo cruz'), corrigir_texto('kase'), 2434.69, -23.2908879, -51.2320966, 1, 'Pendente', '[]', NULL, '2025-12-18', NULL, '2025-11-03', false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(7, NULL, NULL, 'Roçagem', corrigir_texto('rua carijós c araruana'), corrigir_texto('paraná'), 2332.83, -23.3045262, -51.1480067, 1, 'Pendente', '[]', NULL, '2025-12-18', NULL, '2025-11-03', false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(10, NULL, NULL, 'Roçagem', corrigir_texto('av jorge casoni (alça lateral esquina rua guaranis )'), corrigir_texto('casoni'), 452.16, -23.3028976, -51.1494082, 1, 'Pendente', '[]', NULL, '2025-12-18', NULL, '2025-11-03', false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(27, NULL, NULL, 'Roçagem', corrigir_texto('chefe newton'), corrigir_texto('jd. progresso'), 236.96, -23.291337517179304, -51.15234375, 1, 'Pendente', '[]', NULL, '2025-12-18', NULL, '2025-11-03', false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(8, NULL, NULL, 'Roçagem', corrigir_texto('jorge casoni c/ guaicurus'), corrigir_texto('matarazzo'), 244.25, -23.30233468715523, -51.15164637565613, 1, 'Pendente', '[]', NULL, '2025-12-18', NULL, '2025-11-03', false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(14, NULL, NULL, 'Roçagem', corrigir_texto('jorge casoni (da casoni até saturnino de brito e rua sampaio vidal)'), corrigir_texto('casoni'), 908.8, -23.29849, -51.145814, 1, 'Pendente', '[]', NULL, '2025-12-18', NULL, '2025-11-03', false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(21, NULL, NULL, 'Roçagem', corrigir_texto('irma bona dose c angelo vicentini'), corrigir_texto('santa monica'), 3870.42, -23.2869407, -51.1585812, 1, 'Pendente', '[]', NULL, '2025-12-18', NULL, '2025-11-03', false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(36, NULL, NULL, 'Roçagem', corrigir_texto('antonio da silva'), corrigir_texto('novo amparo'), 14876.45, -23.2681358, -51.1751546, 1, 'Concluído', '[{"date":"2025-11-04","type":"completed","status":"Concluído","observation":"Roçagem concluída"},{"date":"2025-11-13","type":"completed","status":"Concluído","observation":"Roçagem concluída"}]', NULL, '2025-12-28', NULL, '2025-11-13', false, 1, 'rocagem', 'importacao_csv', '2025-11-13T18:46:31.696Z', NOW(), NOW()),

(22, NULL, NULL, 'Roçagem', corrigir_texto('r. angelo vicentini (da maria i. v. teodoro até av. lucia h.g. viana)'), corrigir_texto('santa monica'), 7195.78, -23.2865857, -51.1586495, 1, 'Pendente', '[]', NULL, '2025-12-18', NULL, '2025-11-03', false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(549, NULL, NULL, 'Roçagem', corrigir_texto('av da liberdade'), corrigir_texto('ruy v. carnascialli'), 9877.44, -23.2764007, -51.1659238, 1, 'Concluído', '[{"date":"2025-10-14","type":"completed","status":"Concluído","observation":"Roçagem concluída"}]', NULL, '2025-11-28', NULL, '2025-10-14', false, 1, 'rocagem', 'importacao_csv', '2025-11-06T14:31:28.031Z', NOW(), NOW()),

(272, NULL, NULL, 'Roçagem', corrigir_texto('john lennon creche'), corrigir_texto('vivi xavier'), 947.65, -23.3727487, -51.1303451, 1, 'Concluído', '[{"date":"2025-10-03","type":"completed","status":"Concluído","observation":"Roçagem concluída"}]', NULL, '2025-11-17', NULL, '2025-10-03', false, 1, 'rocagem', 'importacao_csv', '2025-11-06T12:07:31.259Z', NOW(), NOW()),

(24, NULL, NULL, 'Roçagem', corrigir_texto('zacaria de goes (da av. lucia h.g.viana até nilo cairo)'), corrigir_texto('jd. paulista'), 2552.8, -23.2904896, -51.1587728, 1, 'Pendente', '[]', NULL, '2025-12-18', NULL, '2025-11-03', false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(30, NULL, NULL, 'Roçagem', corrigir_texto('mario novaes c jose mauricio da silva'), corrigir_texto('portal itamaraca'), 5276.97, -23.2857056, -51.1503428, 1, 'Pendente', '[]', NULL, '2025-12-18', NULL, '2025-11-03', false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(25, NULL, NULL, 'Roçagem', corrigir_texto('coelho neto (do campo de futebol até alça de acesso br-369)'), corrigir_texto('progresso'), 26568.99, -23.2906088, -51.1529114, 1, 'Pendente', '[]', NULL, '2025-12-18', NULL, '2025-11-03', false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(26, NULL, NULL, 'Roçagem', corrigir_texto('carlos rottman'), corrigir_texto('jd. progresso'), 229.61, -23.2921294, -51.1532831, 1, 'Pendente', '[]', NULL, '2025-12-18', NULL, '2025-11-03', false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(28, NULL, NULL, 'Roçagem', corrigir_texto('lúcia h. gonçalves viana c/ visconde de guarapuava'), corrigir_texto('jd. paschoal cantoni'), 703.48, -23.2874127, -51.1550694, 1, 'Pendente', '[]', NULL, '2025-12-18', NULL, '2025-11-03', false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(57, NULL, NULL, 'Roçagem', corrigir_texto('gilberto nápoli e jair pereira batista'), corrigir_texto('michael licha'), 603.8, -23.27864, -51.1592592, 1, 'Pendente', '[]', NULL, '2025-12-18', NULL, '2025-11-03', false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(12, NULL, NULL, 'Roçagem', corrigir_texto('rua tapuias c/ oswaldo cruz'), corrigir_texto('casoni'), 500, -23.277934719585332, -51.14582061767579, 1, 'Pendente', '[]', NULL, '2025-12-18', NULL, '2025-11-03', false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(762, NULL, NULL, 'Roçagem', corrigir_texto('av. adhemar pereira de barros'), corrigir_texto('varios'), 9901.86, -23.3318583, -51.1654323, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(704, NULL, NULL, 'Roçagem', corrigir_texto('rua emilio vizentin / rua joão vicente martins'), corrigir_texto('port. de versalhes'), 4905.25, -23.3171243, -51.1951868, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(817, NULL, NULL, 'Roçagem', corrigir_texto('rua alcino francisco da silva (q-15 l-41) c/ rua renato fabretti'), corrigir_texto('universidade'), 351.08, -23.3307979, -51.216742, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(833, NULL, NULL, 'Roçagem', corrigir_texto('av. octavio genta + praça atrás da fac. pitagoras'), corrigir_texto('terras de davi'), 9362.47, -23.3509164, -51.1810355, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(715, NULL, NULL, 'Roçagem', corrigir_texto('virgilio jorge / nilson ribas/ olavo bilac ( 03 áreas )'), corrigir_texto('champagnat'), 887.6, -23.3054331, -51.1852289, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(800, NULL, NULL, 'Roçagem', corrigir_texto('rua olympio theodoro / norberto kemmer / rua josé piloto'), corrigir_texto('colinas'), 5370.71, -23.3276437, -51.2226143, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(753, NULL, NULL, 'Roçagem', corrigir_texto('rua shangai c/ rua tibet'), corrigir_texto('claudia'), 166.7, -23.338528, -51.1714166, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(771, NULL, NULL, 'Roçagem', corrigir_texto('rua samuel wainer - funcinarios até final da rua'), corrigir_texto('tucano'), 192.1, -23.348603, -51.1535667, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(795, NULL, NULL, 'Roçagem', corrigir_texto('rua adelina piqueti barrios entre as ruas da ginastica olimpica e severino beba rolin'), corrigir_texto('maracana'), 4638.86, -23.3242533, -51.2231843, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(696, NULL, NULL, 'Roçagem', corrigir_texto('rua juhei muramoto c/ rudolph diesel'), corrigir_texto('tokio'), 5296.12, -23.3100873, -51.1923453, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(844, NULL, NULL, 'Roçagem', corrigir_texto('rua maria vidal da silva ao lado do terminal acapulco'), corrigir_texto('acapulco'), 468.11, -23.3619612, -51.1552377, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(56, NULL, NULL, 'Roçagem', corrigir_texto('ramiro marigo c/ jair p. batista'), corrigir_texto('michel lichia'), 1346, -23.27864, -51.1592592, 1, 'Pendente', '[]', NULL, '2025-12-18', NULL, '2025-11-03', false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(46, NULL, NULL, 'Roçagem', corrigir_texto('deoclecio jose da rosa'), corrigir_texto('tropical a'), 1040.56, -23.2787541, -51.1491616, 1, 'Concluído', '[{"date":"2025-11-04","type":"completed","status":"Concluído","observation":"Roçagem concluída"}]', NULL, '2025-12-19', NULL, '2025-11-04', false, 1, 'rocagem', 'importacao_csv', '2025-11-13T18:46:55.203Z', NOW(), NOW()),

(58, NULL, NULL, 'Roçagem', corrigir_texto('jair pereira batista'), corrigir_texto('michael licha'), 4871.45, -23.27864, -51.1592592, 1, 'Pendente', '[]', NULL, '2025-12-18', NULL, '2025-11-03', false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(518, NULL, NULL, 'Roçagem', corrigir_texto('linha ferrea dois lados até av a imperial'), corrigir_texto('milton gavetti'), 16492.56, -23.3062783, -51.136398, 1, 'Concluído', '[{"date":"2025-10-15","type":"completed","status":"Concluído","observation":"Roçagem concluída"}]', NULL, '2025-11-29', NULL, '2025-10-15', false, 1, 'rocagem', 'importacao_csv', '2025-11-06T14:45:59.823Z', NOW(), NOW()),

(223, NULL, NULL, 'Roçagem', corrigir_texto('giocondo maturi'), corrigir_texto('maria celina'), 5287.73, -23.2665921, -51.1995591, 1, 'Concluído', '[{"date":"2025-10-01","type":"completed","status":"Concluído","observation":"Roçagem concluída"}]', NULL, '2025-11-15', NULL, '2025-10-01', false, 1, 'rocagem', 'importacao_csv', '2025-11-06T11:24:39.161Z', NOW(), NOW()),

(61, NULL, NULL, 'Roçagem', corrigir_texto('joão baptista da silva c/ claudir m. rossi'), corrigir_texto('michael licha'), 162.31, -23.2804027, -51.1607961, 1, 'Pendente', '[]', NULL, '2025-12-18', NULL, '2025-11-03', false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(353, NULL, NULL, 'Roçagem', corrigir_texto('francisco ruiz f. assis'), corrigir_texto('luiz de sá'), 27713.26, -23.2546216, -51.1409836, 1, 'Concluído', '[{"date":"2025-10-08","type":"completed","status":"Concluído","observation":"Roçagem concluída"}]', NULL, '2025-11-22', NULL, '2025-10-08', false, 1, 'rocagem', 'importacao_csv', '2025-11-06T13:24:16.075Z', NOW(), NOW()),

(749, NULL, NULL, 'Roçagem', corrigir_texto('rua josé giroldo c/ rua cayena ( 04 áreas )'), corrigir_texto('arco iris'), 1300, -23.3326253, -51.1732022, 2, 'Concluído', '[{"date":"2025-09-30","type":"completed","status":"Concluído","observation":"Roçagem concluída"}]', NULL, '2025-11-14', NULL, '2025-09-30', false, 1, 'rocagem', 'importacao_csv', '2025-11-06T14:36:24.588Z', NOW(), NOW()),

(45, NULL, NULL, 'Roçagem', corrigir_texto('dr juvenal egger filho'), corrigir_texto('farid libos'), 428.25, -23.2761118, -51.1401316, 1, 'Concluído', '[{"date":"2025-11-04","type":"completed","status":"Concluído","observation":"Roçagem concluída"}]', NULL, '2025-12-19', NULL, '2025-11-04', false, 1, 'rocagem', 'importacao_csv', '2025-11-13T18:52:01.814Z', NOW(), NOW()),

(919, NULL, NULL, 'Roçagem', corrigir_texto('firmino l. de oliveira c/ palotina (praça e campo)'), corrigir_texto('pq. das indutrias'), 12292.56, -23.3122995, -51.1851122, 2, 'Concluído', '[{"date":"2025-10-30","type":"completed","status":"Concluído","observation":"Roçagem concluída"}]', NULL, '2025-12-14', NULL, '2025-10-30', false, 1, 'rocagem', 'importacao_csv', '2025-11-06T01:04:18.593Z', NOW(), NOW()),

(1026, NULL, NULL, 'Roçagem', corrigir_texto('nereu mendes c/ maurilio mazzer / maria a. miranda (academia ar livre)'), corrigir_texto('monte sinai'), 4246.27, -23.326419, -51.1163662, 2, 'Concluído', '[{"date":"2025-10-06","type":"completed","status":"Concluído","observation":"Roçagem concluída"}]', NULL, '2025-11-20', NULL, '2025-10-06', false, 1, 'rocagem', 'importacao_csv', '2025-11-06T16:18:20.553Z', NOW(), NOW()),

(927, NULL, NULL, 'Roçagem', corrigir_texto('ruas francisco a. galhardi / dep. agnaldo p. lima / vitório zanoni / cabo luís budziak'), corrigir_texto('roseira'), 7205.56, -23.3559601, -51.1404669, 2, 'Concluído', '[{"date":"2025-11-03","type":"completed","status":"Concluído","observation":"Roçagem concluída"}]', NULL, '2025-12-18', NULL, '2025-11-03', false, 1, 'rocagem', 'importacao_csv', '2025-11-06T01:27:42.200Z', NOW(), NOW()),

(738, NULL, NULL, 'Roçagem', corrigir_texto('rua das grevileas c/ rua das açucenas (02 areas)'), corrigir_texto('colina verde'), 5278.21, -23.3216325, -51.1873462, 2, 'Concluído', '[{"date":"2025-09-30","type":"completed","status":"Concluído","observation":"Roçagem concluída"}]', NULL, '2025-11-14', NULL, '2025-09-30', false, 1, 'rocagem', 'importacao_csv', '2025-11-06T12:08:45.914Z', NOW(), NOW()),

(1062, NULL, NULL, 'Roçagem', corrigir_texto('gabriel matokanovic c/ ruth ferreira de souza'), corrigir_texto('da luz'), 2938.02, -23.3169363, -51.1106596, 2, 'Concluído', '[{"date":"2025-11-04","type":"completed","status":"Concluído","observation":"Roçagem concluída"},{"date":"2025-10-02","type":"completed","status":"Concluído","observation":"Roçagem concluída"}]', NULL, '2025-11-16', NULL, '2025-10-02', false, 1, 'rocagem', 'importacao_csv', '2025-11-06T15:02:17.875Z', NOW(), NOW()),

(1089, NULL, NULL, 'Roçagem', corrigir_texto('mario nogueira monteiro c/ franz hasselman / ernesto casa grande'), corrigir_texto('são pedro'), 6602.71, -23.3125099, -51.1276471, 2, 'Concluído', '[{"date":"2025-10-31","type":"completed","status":"Concluído","observation":"Roçagem concluída"},{"date":"2025-10-01","type":"completed","status":"Concluído","observation":"Roçagem concluída"}]', NULL, '2025-11-15', NULL, '2025-10-01', false, 1, 'rocagem', 'importacao_csv', '2025-11-06T14:56:23.166Z', NOW(), NOW()),

(725, NULL, NULL, 'Roçagem', corrigir_texto('humaita entre monte castelo e montese (03 areas)'), corrigir_texto('higienopolis'), 1743.03, -23.3199768, -51.1678002, 2, 'Concluído', '[{"date":"2025-09-29","type":"completed","status":"Concluído","observation":"Roçagem concluída"}]', NULL, '2025-11-13', NULL, '2025-09-29', false, 1, 'rocagem', 'importacao_csv', '2025-11-06T11:42:25.145Z', NOW(), NOW()),

(59, NULL, NULL, 'Roçagem', corrigir_texto('joão baptista da silva'), corrigir_texto('michael licha'), 3738.54, -23.2804027, -51.1607961, 1, 'Pendente', '[]', NULL, '2025-12-18', NULL, '2025-11-03', false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(849, NULL, NULL, 'Roçagem', corrigir_texto('rua cornelio pires c/ rua minervino l. de oliveira (02 areas)'), corrigir_texto('cafezal'), 2225.69, -23.3724998, -51.1602704, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(851, NULL, NULL, 'Roçagem', corrigir_texto('rua nicolau barra rosa c/ rua joaquim pereira'), corrigir_texto('cafezal'), 2501.06, -23.373888, -51.1602373, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(877, NULL, NULL, 'Roçagem', corrigir_texto('rua jose o. figueiredo c/ gilney c. leal (acesso viaduto) 02 lados'), corrigir_texto('jamile dequech'), 2798.71, -23.3197305, -51.1662008, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(909, NULL, NULL, 'Roçagem', corrigir_texto('- rua carlos mantova c/ francisco boer'), corrigir_texto('são lourenço'), 1478.08, -23.3701736, -51.127481, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(900, NULL, NULL, 'Roçagem', corrigir_texto('elisa michelete vicente'), corrigir_texto('nova esperança'), 1346.57, -23.3927584, -51.1130546, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(889, NULL, NULL, 'Roçagem', corrigir_texto('rua elson pedro dos santos com adelina faria de menezes e rua dos almoxarifes'), corrigir_texto('uniao da vitoria'), 1678.51, -23.3885585, -51.1298862, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(960, NULL, NULL, 'Roçagem', corrigir_texto('av. albania e portugal'), corrigir_texto('igapo'), 2624.15, -23.3400249, -51.1485513, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(1100, NULL, NULL, 'Roçagem', corrigir_texto('rua elvira bruggin entre as ruas joão de oliviera neto e henriqueta tubman'), corrigir_texto('jd. oriente'), 443.11, -23.3173931, -51.1395297, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(1011, NULL, NULL, 'Roçagem', corrigir_texto('sonia maria m. garcia c/ leopoldo meyer'), corrigir_texto('taruma'), 347.2, -23.3294928, -51.1254113, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(1055, NULL, NULL, 'Roçagem', corrigir_texto('luiz generoso da silva e onofra moreira de moraes'), corrigir_texto('do leste'), 719.74, -23.3180782, -51.1165092, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(963, NULL, NULL, 'Roçagem', corrigir_texto('grecia c/ dinamarca'), corrigir_texto('igapo'), 2663.61, -23.341927, -51.1482904, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(978, NULL, NULL, 'Roçagem', corrigir_texto('rua guilherme negro / rua aristides l. da fonseca / rua antonio luciano'), corrigir_texto('nova conquista'), 14726.66, -23.3369414, -51.1413519, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(806, NULL, NULL, 'Roçagem', corrigir_texto('madre teresa de calcuta c/ jose olavo leles (academia ao ar livre)'), corrigir_texto('joao turquino'), 1648.17, -23.3197305, -51.1662008, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(821, NULL, NULL, 'Roçagem', corrigir_texto('av. est. armarinho paulista e av. gil de abreu(fte condominio)'), corrigir_texto('jd. universidade'), 5864.36, -23.3449975, -51.225541, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(970, NULL, NULL, 'Roçagem', corrigir_texto('rua paquistao c/ av. estados unidos'), corrigir_texto('igapo'), 2051.37, -23.3444821, -51.1494835, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(1005, NULL, NULL, 'Roçagem', corrigir_texto('rua pero vaz de caminha c/ rua são sisto i'), corrigir_texto('albatroz'), 160.72, -23.3275815, -51.1348985, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(1020, NULL, NULL, 'Roçagem', corrigir_texto('rua carlos merbach c/ rua harue tanaka'), corrigir_texto('res. havana'), 562.54, -23.3322651, -51.1128192, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(1112, NULL, NULL, 'Roçagem', corrigir_texto('rua afonso pena c/ rua general osório'), corrigir_texto('dist. são luiz'), 741.69, -23.3133784, -51.1847367, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(1113, NULL, NULL, 'Roçagem', corrigir_texto('rua da graça c/ rua salvador gomes'), corrigir_texto('dist. guaravera'), 7054.13, -23.6112606, -51.1836254, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(1114, NULL, NULL, 'Roçagem', corrigir_texto('rua salvador gomes c/ rua anchieta'), corrigir_texto('dist. guaravera'), 888.32, -23.2942069, -51.171848, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(979, NULL, NULL, 'Roçagem', corrigir_texto('rua alan kardek c/ rua teodoro roosevelt / rua leon denis'), corrigir_texto('california'), 926.16, -23.3319099, -51.1413839, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(583, NULL, NULL, 'Roçagem', corrigir_texto('café arábica c/ lindalva b m campos'), corrigir_texto('res. do café'), 185.38, -23.2702064, -51.1828017, 1, 'Concluído', '[{"date":"2025-10-01","type":"completed","status":"Concluído","observation":"Roçagem concluída"}]', NULL, '2025-11-15', NULL, '2025-10-01', false, 1, 'rocagem', 'importacao_csv', '2025-11-06T11:14:29.375Z', NOW(), NOW()),

(853, NULL, NULL, 'Roçagem', corrigir_texto('rua joaquim pereira c/ rua jose da silva paizano / rua jose b. ribeiro'), corrigir_texto('cafezal'), 1026.19, -23.3714228, -51.1575182, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(1124, NULL, NULL, 'Roçagem', corrigir_texto('rod. benedito bento dos santos'), corrigir_texto('dist. irerê'), 9715.22, -23.3197305, -51.1662008, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(710, NULL, NULL, 'Roçagem', corrigir_texto('rua armando balarotte (rotatoria da av. castelo branco até marginal pr-445)'), corrigir_texto('port. de versalhes'), 37682, -23.3204463, -51.1985185, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(1042, NULL, NULL, 'Roçagem', corrigir_texto('denilton dos santos c/ mario sergio carmagnani e maria antonia dias'), corrigir_texto('guilherme pires'), 2981.89, -23.3259024, -51.1116184, 2, 'Concluído', '[{"date":"2025-10-03","type":"completed","status":"Concluído","observation":"Roçagem concluída"}]', NULL, '2025-11-17', NULL, '2025-10-03', false, 1, 'rocagem', 'importacao_csv', '2025-11-06T16:06:12.198Z', NOW(), NOW()),

(1030, NULL, NULL, 'Roçagem', corrigir_texto('anna gomes rosin c/ ermelino nonino'), corrigir_texto('vale do cedro'), 1231.62, -23.3197305, -51.1662008, 2, 'Concluído', '[{"date":"2025-10-06","type":"completed","status":"Concluído","observation":"Roçagem concluída"}]', NULL, '2025-11-20', NULL, '2025-10-06', false, 1, 'rocagem', 'importacao_csv', '2025-11-06T16:20:49.185Z', NOW(), NOW()),

(1061, NULL, NULL, 'Roçagem', corrigir_texto('rua crescentino sisti / kazuo tsuchiya / abílio joão de medeiros'), corrigir_texto('jd. tenerife'), 7646.78, -23.32826, -51.1023614, 2, 'Concluído', '[{"date":"2025-10-03","type":"completed","status":"Concluído","observation":"Roçagem concluída"}]', NULL, '2025-11-17', NULL, '2025-10-03', false, 1, 'rocagem', 'importacao_csv', '2025-11-06T16:12:19.090Z', NOW(), NOW()),

(1057, NULL, NULL, 'Roçagem', corrigir_texto('av. jamil scaff'), corrigir_texto('varios'), 18098.67, -23.3211686, -51.1110517, 2, 'Concluído', '[{"date":"2025-11-04","type":"completed","status":"Concluído","observation":"Roçagem concluída"},{"date":"2025-10-03","type":"completed","status":"Concluído","observation":"Roçagem concluída"}]', NULL, '2025-11-17', NULL, '2025-10-03', false, 1, 'rocagem', 'importacao_csv', '2025-11-06T16:09:27.859Z', NOW(), NOW()),

(933, NULL, NULL, 'Roçagem', corrigir_texto('cabo luiz budziak c/ salvatina m. rosa'), corrigir_texto('piza'), 877.2, -23.3555223, -51.1399996, 2, 'Concluído', '[{"date":"2025-11-03","type":"completed","status":"Concluído","observation":"Roçagem concluída"}]', NULL, '2025-12-18', NULL, '2025-11-03', false, 1, 'rocagem', 'importacao_csv', '2025-11-06T01:28:59.469Z', NOW(), NOW()),

(934, NULL, NULL, 'Roçagem', corrigir_texto('ruas edmundo gonçalves / alexandre sahyun / isabel c. dos santos / rua doze'), corrigir_texto('neman sahyun'), 4812.7, -23.3581806, -51.1354323, 2, 'Concluído', '[{"date":"2025-11-03","type":"completed","status":"Concluído","observation":"Roçagem concluída"}]', NULL, '2025-12-18', NULL, '2025-11-03', false, 1, 'rocagem', 'importacao_csv', '2025-11-06T01:29:44.738Z', NOW(), NOW()),

(1063, NULL, NULL, 'Roçagem', corrigir_texto('armando strigueta c/ maria scudeler galdino'), corrigir_texto('abussafe'), 436.23, -23.3221409, -51.1092771, 2, 'Concluído', '[{"date":"2025-11-04","type":"completed","status":"Concluído","observation":"Roçagem concluída"},{"date":"2025-10-02","type":"completed","status":"Concluído","observation":"Roçagem concluída"}]', NULL, '2025-11-16', NULL, '2025-10-02', false, 1, 'rocagem', 'importacao_csv', '2025-11-06T15:03:11.137Z', NOW(), NOW()),

(1065, NULL, NULL, 'Roçagem', corrigir_texto('rua edvaldo luis mazari / severino mendes de almeida (toda extensao)'), corrigir_texto('abussafe'), 2547.26, -23.3160449, -51.107278, 2, 'Concluído', '[{"date":"2025-11-04","type":"completed","status":"Concluído","observation":"Roçagem concluída"},{"date":"2025-10-02","type":"completed","status":"Concluído","observation":"Roçagem concluída"}]', NULL, '2025-11-16', NULL, '2025-10-02', false, 1, 'rocagem', 'importacao_csv', '2025-11-06T15:07:17.945Z', NOW(), NOW()),

(948, NULL, NULL, 'Roçagem', corrigir_texto('rua andre galo c/ rua pedro batista de souza'), corrigir_texto('são vicente'), 2616.34, -23.351574296942857, -51.14936113357545, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', 'importacao_csv', NOW(), NOW(), NOW()),

(91, NULL, NULL, 'Roçagem', corrigir_texto('perobal'), corrigir_texto('leonor'), 244.81, -23.2915165, -51.1952744, 1, 'Concluído', '[{"date":"2025-11-06","type":"completed","status":"Concluído","observation":"Roçagem concluída"}]', NULL, '2025-12-21', NULL, '2025-11-06', false, 1, 'rocagem', 'importacao_csv', '2025-11-13T19:34:28.668Z', NOW(), NOW());

-- Verificar se os dados foram importados corretamente
SELECT 
    id,
    endereco,
    bairro,
    metragem_m2,
    lat,
    lng,
    status,
    CASE 
        WHEN history != '[]' THEN '✅ Tem histórico'
        ELSE '❌ Sem histórico'
    END as tem_historico
FROM service_areas 
WHERE registrado_por = 'importacao_csv' 
ORDER BY id 
LIMIT 10;