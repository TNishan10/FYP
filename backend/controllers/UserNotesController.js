import con from "../server.js";

export const getUserNotesController = async (req, res) => {
    try {
        const query = 'SELECT * FROM public."user_notes"';
        const result = await con
            .query(query);
        res
            .status(200)
            .json({
                message: "Data fetched successfully!",
                data: result.rows,
            }); 
    }
    catch (error) {
        console.error("Error executing query", error.stack);
        res
            .status(500)
            .json({
                message: "Error fetching data",
                error: error.message,
            });
    }   
}

export const createUserNotesController = async (req, res) => {
    try {
        // Extract data from request body
        const { notes, user_id } = req.body;
        
        // Validate request data
        if (!notes || !user_id) {
            return res.status(400).json({
                success: false,
                message: "Notes and user_id are required fields"
            });
        }

        // Insert new note into database
        const query = 'INSERT INTO public."user_notes" (notes, user_id) VALUES ($1, $2) RETURNING *';
        const values = [notes, user_id];
        
        const result = await con.query(query, values);
        
        res.status(201).json({
            success: true,
            message: "Note created successfully",
            data: result.rows[0]
        });
    }
    catch (error) {
        console.error("Error creating note:", error.stack);
        
        // Handle foreign key constraint failure
        if (error.code === '23503') {
            return res.status(400).json({
                success: false,
                message: "User ID does not exist",
                error: "Foreign key constraint failed"
            });
        }
        
        res.status(500).json({
            success: false,
            message: "Error creating note",
            error: error.message
        });
    }
}