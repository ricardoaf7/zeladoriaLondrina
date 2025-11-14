-- Importação de 50 linhas do CSV - Lote 1 (apenas IDs que não existem)
-- Data: 2025-11-14

-- Usar INSERT com ON CONFLICT para ignorar IDs duplicados
INSERT INTO service_areas (
  id, ordem, sequencia_cadastro, tipo, endereco, bairro, metragem_m2, lat, lng, 
  lote, status, history, polygon, scheduled_date, proxima_previsao, ultima_rocagem, 
  manual_schedule, days_to_complete, servico, registrado_por, data_registro
) VALUES 
-- 50 linhas do CSV
(16, NULL, NULL, 'Roçagem', 'icós', 'são caetano', 438.56, -23.3014941, -51.1550653, 1, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', NULL, NULL),
(17, NULL, NULL, 'Roçagem', 'tembés', 'portuguesa', 348, -23.3023949, -51.154633, 1, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', NULL, NULL),
(18, NULL, NULL, 'Roçagem', 'tiete c john kennedy', 'recreio', 1915.41, -23.2953414, -51.1589755, 1, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', NULL, NULL),
(635, NULL, NULL, 'Roçagem', 'rua gustavo barroso c/ av. tiradentes', 'shangri - la a', 6371.05, -23.3013172, -51.1774531, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', NULL, NULL),
(19, NULL, NULL, 'Roçagem', 'tietê c duque de caxias 2 praças', 'recreio', 2457, -23.3272806, -51.1540579, 1, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', NULL, NULL),
(637, NULL, NULL, 'Roçagem', 'porto alegre em frente ao nº 120', 'vila agari', 170.01, -30.0368176, -51.2089887, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', NULL, NULL),
(641, NULL, NULL, 'Roçagem', 'trav. farroupilha / rua castro alves', 'shangri - la a', 6358.13, -23.2990914, -51.1860962, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', NULL, NULL),
(657, NULL, NULL, 'Roçagem', 'mercurio c/ marte / capricornio', 'do sol', 1825.27, -23.2740063, -51.1861348, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', NULL, NULL),
(664, NULL, NULL, 'Roçagem', 'rua sergio cardoso quadra 18a lotes 08, 09 e 10', 'são francisco de assis', 1303.16, -23.3197305, -51.1662008, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', NULL, NULL),
(676, NULL, NULL, 'Roçagem', 'serra dos pirineus c/ serra do monte carlo', 'bandeirantes', 3428.35, -23.2974051, -51.2014976, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', NULL, NULL),
(643, NULL, NULL, 'Roçagem', 'leste oeste c/ luiz delfino', 'shangri - la a', 2246.88, -23.2977069, -51.1897832, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', NULL, NULL),
(589, NULL, NULL, 'Roçagem', 'rua mato grosso c/ av. arc. dom geraldo fernandes - pai', 'centro', 1973.45, -23.3005648, -51.2241743, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', NULL, NULL),
(592, NULL, NULL, 'Roçagem', 'rua sen. souza naves c/ rua piaui (concha)', 'centro', 722.72, -23.3130619, -51.1575552, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', NULL, NULL),
(606, NULL, NULL, 'Roçagem', 'av. higienópolis c/ rua valparaiso / rua santiago', 'guanabara', 1869.2, -23.3105478, -51.1658269, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', NULL, NULL),
(616, NULL, NULL, 'Roçagem', 'rua guarujá c/ rua flórida', 'jd. flórida', 140.76, -23.3276614, -51.1519421, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', NULL, NULL),
(624, NULL, NULL, 'Roçagem', 'rua urbano duarte c/ rua libero badaro', 'nova londres', 5300.47, -23.3320085, -51.1557352, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', NULL, NULL),
(11, NULL, NULL, 'Roçagem', 'rua tupiniquins (duas laterais)', 'casoni', 150, -23.3028976, -51.1494082, 1, 'Pendente', '[]', NULL, '2025-12-18', '2025-11-03', NULL, false, 1, 'rocagem', NULL, NULL),
(13, NULL, NULL, 'Roçagem', 'jorge casoni c/ camacan e alexandre albertoni (2 areas)', 'kase', 722.44, -23.2949574, -51.1471296, 1, 'Pendente', '[]', NULL, '2025-12-18', '2025-11-03', NULL, false, 1, 'rocagem', NULL, NULL),
(15, NULL, NULL, 'Roçagem', 'vital brasil c oswaldo cruz', 'kase', 2434.69, -23.2908879, -51.2320966, 1, 'Pendente', '[]', NULL, '2025-12-18', '2025-11-03', NULL, false, 1, 'rocagem', NULL, NULL),
(7, NULL, NULL, 'Roçagem', 'rua carijós c araruana', 'paraná', 2332.83, -23.3045262, -51.1480067, 1, 'Pendente', '[]', NULL, '2025-12-18', '2025-11-03', NULL, false, 1, 'rocagem', NULL, NULL),
(10, NULL, NULL, 'Roçagem', 'av jorge casoni (alça lateral esquina rua guaranis )', 'casoni', 452.16, -23.3028976, -51.1494082, 1, 'Pendente', '[]', NULL, '2025-12-18', '2025-11-03', NULL, false, 1, 'rocagem', NULL, NULL),
(27, NULL, NULL, 'Roçagem', 'chefe newton', 'jd. progresso', 236.96, -23.291337517179304, -51.15234375, 1, 'Pendente', '[]', NULL, '2025-12-18', '2025-11-03', NULL, false, 1, 'rocagem', NULL, NULL),
(8, NULL, NULL, 'Roçagem', 'jorge casoni c/ guaicurus', 'matarazzo', 244.25, -23.30233468715523, -51.15164637565613, 1, 'Pendente', '[]', NULL, '2025-12-18', '2025-11-03', NULL, false, 1, 'rocagem', NULL, NULL),
(14, NULL, NULL, 'Roçagem', 'jorge casoni (da casoni até saturnino de brito e rua sampaio vidal)', 'casoni', 908.8, -23.29849, -51.145814, 1, 'Pendente', '[]', NULL, '2025-12-18', '2025-11-03', NULL, false, 1, 'rocagem', NULL, NULL),
(21, NULL, NULL, 'Roçagem', 'irma bona dose c angelo vicentini', 'santa monica', 3870.42, -23.2869407, -51.1585812, 1, 'Pendente', '[]', NULL, '2025-12-18', '2025-11-03', NULL, false, 1, 'rocagem', NULL, NULL),
(36, NULL, NULL, 'Roçagem', 'antonio da silva', 'novo amparo', 14876.45, -23.2681358, -51.1751546, 1, 'Concluído', '[{"date":"2025-11-04","type":"completed","status":"Concluído","observation":"Roçagem concluída"},{"date":"2025-11-13","type":"completed","status":"Concluído","observation":"Roçagem concluída"}]', NULL, '2025-12-28', '2025-11-13', NULL, false, 1, 'rocagem', NULL, '2025-11-13T18:46:31.696Z'),
(22, NULL, NULL, 'Roçagem', 'r. angelo vicentini (da maria i. v. teodoro até av. lucia h.g. viana)', 'santa monica', 7195.78, -23.2865857, -51.1586495, 1, 'Pendente', '[]', NULL, '2025-12-18', '2025-11-03', NULL, false, 1, 'rocagem', NULL, NULL),
(549, NULL, NULL, 'Roçagem', 'av da liberdade', 'ruy v. carnascialli', 9877.44, -23.2764007, -51.1659238, 1, 'Concluído', '[{"date":"2025-10-14","type":"completed","status":"Concluído","observation":"Roçagem concluída"}]', NULL, '2025-11-28', '2025-10-14', NULL, false, 1, 'rocagem', NULL, '2025-11-06T14:31:28.031Z'),
(272, NULL, NULL, 'Roçagem', 'john lennon creche', 'vivi xavier', 947.65, -23.3727487, -51.1303451, 1, 'Concluído', '[{"date":"2025-10-03","type":"completed","status":"Concluído","observation":"Roçagem concluída"}]', NULL, '2025-11-17', '2025-10-03', NULL, false, 1, 'rocagem', NULL, '2025-11-06T12:07:31.259Z'),
(24, NULL, NULL, 'Roçagem', 'zacaria de goes (da av. lucia h.g.viana até nilo cairo)', 'jd. paulista', 2552.8, -23.2904896, -51.1587728, 1, 'Pendente', '[]', NULL, '2025-12-18', '2025-11-03', NULL, false, 1, 'rocagem', NULL, NULL),
(30, NULL, NULL, 'Roçagem', 'mario novaes c jose mauricio da silva', 'portal itamaraca', 5276.97, -23.2857056, -51.1503428, 1, 'Pendente', '[]', NULL, '2025-12-18', '2025-11-03', NULL, false, 1, 'rocagem', NULL, NULL),
(25, NULL, NULL, 'Roçagem', 'coelho neto (do campo de futebol até alça de acesso br-369)', 'progresso', 26568.99, -23.2906088, -51.1529114, 1, 'Pendente', '[]', NULL, '2025-12-18', '2025-11-03', NULL, false, 1, 'rocagem', NULL, NULL),
(26, NULL, NULL, 'Roçagem', 'carlos rottman', 'jd. progresso', 229.61, -23.2921294, -51.1532831, 1, 'Pendente', '[]', NULL, '2025-12-18', '2025-11-03', NULL, false, 1, 'rocagem', NULL, NULL),
(28, NULL, NULL, 'Roçagem', 'lúcia h. gonçalves viana c/ visconde de guarapuava', 'jd. paschoal cantoni', 703.48, -23.2874127, -51.1550694, 1, 'Pendente', '[]', NULL, '2025-12-18', '2025-11-03', NULL, false, 1, 'rocagem', NULL, NULL),
(57, NULL, NULL, 'Roçagem', 'gilberto nápoli e jair pereira batista', 'michael licha', 603.8, -23.27864, -51.1592592, 1, 'Pendente', '[]', NULL, '2025-12-18', '2025-11-03', NULL, false, 1, 'rocagem', NULL, NULL),
(12, NULL, NULL, 'Roçagem', 'rua tapuias c/ oswaldo cruz', 'casoni', 500, -23.277934719585332, -51.14582061767579, 1, 'Pendente', '[]', NULL, '2025-12-18', '2025-11-03', NULL, false, 1, 'rocagem', NULL, NULL),
(762, NULL, NULL, 'Roçagem', 'av. adhemar pereira de barros', 'varios', 9901.86, -23.3318583, -51.1654323, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', NULL, NULL),
(704, NULL, NULL, 'Roçagem', 'rua emilio vizentin / rua joão vicente martins', 'port. de versalhes', 4905.25, -23.3171243, -51.1951868, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', NULL, NULL),
(817, NULL, NULL, 'Roçagem', 'rua alcino francisco da silva (q-15 l-41) c/ rua renato fabretti', 'universidade', 351.08, -23.3307979, -51.216742, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', NULL, NULL),
(833, NULL, NULL, 'Roçagem', 'av. octavio genta + praça atrás da fac. pitagoras', 'terras de davi', 9362.47, -23.3509164, -51.1810355, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', NULL, NULL),
(715, NULL, NULL, 'Roçagem', 'virgilio jorge / nilson ribas/ olavo bilac ( 03 áreas )', 'champagnat', 887.6, -23.3054331, -51.1852289, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', NULL, NULL),
(800, NULL, NULL, 'Roçagem', 'rua olympio theodoro / norberto kemmer / rua josé piloto', 'colinas', 5370.71, -23.3276437, -51.2226143, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', NULL, NULL),
(753, NULL, NULL, 'Roçagem', 'rua shangai c/ rua tibet', 'claudia', 166.7, -23.338528, -51.1714166, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', NULL, NULL),
(771, NULL, NULL, 'Roçagem', 'rua samuel wainer - funcinarios até final da rua', 'tucano', 192.1, -23.348603, -51.1535667, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', NULL, NULL),
(795, NULL, NULL, 'Roçagem', 'rua adelina piqueti barrios entre as ruas da ginastica olimpica e severino beba rolin', 'maracana', 4638.86, -23.3242533, -51.2231843, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', NULL, NULL),
(696, NULL, NULL, 'Roçagem', 'rua juhei muramoto c/ rudolph diesel', 'tokio', 5296.12, -23.3100873, -51.1923453, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', NULL, NULL),
(844, NULL, NULL, 'Roçagem', 'rua maria vidal da silva ao lado do terminal acapulco', 'acapulco', 468.11, -23.3619612, -51.1552377, 2, 'Pendente', '[]', NULL, '2025-11-06', NULL, NULL, false, 1, 'rocagem', NULL, NULL),
(56, NULL, NULL, 'Roçagem', 'ramiro marigo c/ jair p. batista', 'michel lichia', 1346, -23.27864, -51.1592592, 1, 'Pendente', '[]', NULL, '2025-12-18', '2025-11-03', NULL, false, 1, 'rocagem', NULL, NULL),
(46, NULL, NULL, 'Roçagem', 'deoclecio jose da rosa', 'tropical a', 1040.56, -23.2787541, -51.1491616, 1, 'Concluído', '[{"date":"2025-11-04","type":"completed","status":"Concluído","observation":"Roçagem concluída"}]', NULL, '2025-12-19', '2025-11-04', NULL, false, 1, 'rocagem', NULL, '2025-11-13T18:46:55.203Z')
ON CONFLICT (id) DO NOTHING;

-- Verificar quantidade de registros inseridos
SELECT COUNT(*) as total_importado, 
       COUNT(CASE WHEN status = 'Concluído' THEN 1 END) as concluidos,
       COUNT(CASE WHEN status = 'Pendente' THEN 1 END) as pendentes
FROM service_areas 
WHERE id BETWEEN 7 AND 844;