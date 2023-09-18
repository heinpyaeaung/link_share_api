const request = require('supertest');
const {Infos} = require('../models/infos.js');
let server;
describe('/api/infos/', () => {
    beforeEach(() => { server = require('../server.js'); });
    afterEach(async () => { 
        server.close();
        // await Infos.deleteMany({});
     });
    describe('POST/', () => {
        it('it should return 201 if it is valid', async function(){
            const res = await request(server)
                .post('/api/add_infos/')
                .send({
                    name: 'hein pyae',
                    gmail: 'hein@gmail.com',
                    hobbies:['singing,listening'],
                    links: [{icon: 'js.img', link: 'www.js.org'}]
                });

            expect(res.status).toBe(201);
        });
    })
})