import { FifaVersion } from '../types'

export const UCL_TEAMS: Partial<Record<FifaVersion, string[]>> = {
    fc22: [
        'manchester_city_fc22', 'liverpool_fc22', 'chelsea_fc22', 'manchester_united_fc22',
        'real_madrid_cf_fc22', 'fc_barcelona_fc22', 'atletico_de_madrid_fc22', 'villarreal_cf_fc22', 'sevilla_fc_fc22',
        'fc_bayern_munchen_fc22', 'rb_leipzig_fc22',
        'inter_fc22', 'ac_milan_fc22',
        'paris_saint_germain_fc22',
        'fc_porto_fc22', 'sl_benfica_fc22', 'sporting_cp_fc22',
    ],
    fc23: [
        'manchester_city_fc23', 'liverpool_fc23', 'chelsea_fc23', 'manchester_united_fc23', 'newcastle_united_fc23',
        'real_madrid_fc23', 'fc_barcelona_fc23', 'atletico_madrid_fc23', 'villarreal_fc23', 'sevilla_fc23',
        'fc_bayern_munchen_fc23', 'rb_leipzig_fc23',
        'inter_fc23', 'milan_fc23', 'napoli_fc23',
        'paris_saint_germain_fc23',
        'porto_fc23', 'sporting_cp_fc23',
    ],
    fc24: [
        'manchester_city_fc24', 'liverpool_fc24', 'arsenal_fc24', 'chelsea_fc24',
        'real_madrid_fc24', 'fc_barcelona_fc24',
        'fc_bayern_munchen_fc24', 'rb_leipzig_fc24',
        'inter_fc24', 'milan_fc24',
        'sporting_cp_fc24',
    ],
    fc25: [], 
    fc26: [
        'liverpool_fc26', 'arsenal_fc26', 'manchester_city_fc26', 'chelsea_fc26', 'aston_villa_fc26',
        'real_madrid_fc26', 'fc_barcelona_fc26', 'atletico_de_madrid_fc26',
        'fc_bayern_munchen_fc26', 'borussia_dortmund_fc26', 'leverkusen_fc26', 'rb_leipzig_fc26', 'vfb_stuttgart_fc26',
        'lombardia_fc_fc26', 'ssc_napoli_fc26', 'juventus_fc26', 'bergamo_calcio_fc26',
        'paris_sg_fc26',
        'fc_porto_fc26', 'sl_benfica_fc26', 'sporting_cp_fc26',
    ],
}