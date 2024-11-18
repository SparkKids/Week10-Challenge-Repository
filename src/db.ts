//const { Pool } = require('pg');
import { QueryResult } from 'pg';
import { connectToDb, pool/*, connectToDb*/ } from './connection.js';
await connectToDb();
class Database {
    constructor() {
        // Create a new pool instance
        // this.pool = new Pool({
        //     user: 'your_username',
        //     host: 'localhost',
        //     database: 'your_database',
        //     password: 'your_password',
        //     port: 5432,
        // });
    }

    // Method to get all employees
    async getEmployees() {
        console.log("getEmployees");
        const sql = `SELECT id, first_name, last_name, role_id, manager_id FROM public.employee`;
        console.log("Before pool.query")
        await pool.query(sql, (err: Error, result: QueryResult) => {
            console.log("pool.query")
            if (err) {
                console.log("pool.query error")
                console.log(err);
            } else if (result) {
                console.log("result")
                console.log(result.rows);
            }
        })
    }

    /* // Method to get a user by ID
    async getUserById(id) {
        const query = 'SELECT * FROM users WHERE id = $1';
        const res = await this.pool.query(query, [id]);
        return res.rows[0];
    }

    // Method to add a new user
    async addUser(name, email) {
        const query = 'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *';
        const res = await this.pool.query(query, [name, email]);
        return res.rows[0];
    }

    // Method to update a user
    async updateUser(id, name, email) {
        const query = 'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *';
        const res = await this.pool.query(query, [name, email, id]);
        return res.rows[0];
    }

    // Method to delete a user
    async deleteUser(id) {
        const query = 'DELETE FROM users WHERE id = $1 RETURNING *';
        const res = await this.pool.query(query, [id]);
        return res.rows[0];
    } */
}

module.exports = Database;