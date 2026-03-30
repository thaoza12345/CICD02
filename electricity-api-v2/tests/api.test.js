const request = require('supertest');
const app = require('../index');

describe('Electricity API Endpoints', () => {

    // Test Case 1: Total Usage ทุกปี
    it('should return total electricity usage for all years', async () => {
        const res = await request(app).get('/api/usages/totalyear');
        expect(res.status).toBe(200);
        expect(typeof res.body).toBe('object');
    });

    // Test Case 2: Usage ของ province + year (not found case)
    it('should return "Data not found" for invalid province/year', async () => {
        const res = await request(app).get('/api/usage/Alberta/2566');
        expect(res.body.message).toBe('Data not found');
    });

    // Test Case 3: User history ของ province
    it('should return user history for a specific province', async () => {
        const res = await request(app).get('/api/pastusers/Bangkok');
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    // ✅ Test Case 4: Total users ทุกปี
    it('should return total electricity users for all years', async () => {
        const res = await request(app).get('/api/users/totalyear');
        expect(res.status).toBe(200);
        expect(typeof res.body).toBe('object');
    });

    // ✅ Test Case 5: Users ของ province + year
    it('should return electricity users for a specific province and year', async () => {
        const res = await request(app).get('/api/user/Bangkok/2565');

        expect(res.status).toBe(200);

        // สมมติว่า API คืน object
        expect(typeof res.body).toBe('object');

        // เช็คว่ามี field สำคัญ
        expect(res.body).toHaveProperty('province');
        expect(res.body).toHaveProperty('year');
        expect(res.body).toHaveProperty('users');
    });

    // ✅ Test Case 6: Invalid year format (error case)
    it('should return error for invalid year format', async () => {
        const res = await request(app).get('/api/usage/Bangkok/abcd');

        expect(res.status).toBe(400); // หรือ 422 แล้วแต่ที่คุณ define
        expect(res.body).toHaveProperty('message');
    });

    // ✅ Test Case 7: Province ไม่มีในระบบ
    it('should return error for non-existing province', async () => {
        const res = await request(app).get('/api/pastusers/UnknownCity');

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Province not found');
    });

});