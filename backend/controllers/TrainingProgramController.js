import con from "../server.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { v4 as uuidv4 } from "uuid";

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get all training programs with optional filtering
export const getAllTrainingPrograms = async (req, res) => {
  try {
    const { goal_type, difficulty } = req.query;

    let query = "SELECT * FROM training_programs";
    const params = [];

    // Add filters if provided
    if (goal_type || difficulty) {
      query += " WHERE";

      if (goal_type) {
        params.push(goal_type);
        query += ` goal_type = $${params.length}`;
      }

      if (goal_type && difficulty) {
        query += " AND";
      }

      if (difficulty) {
        params.push(difficulty);
        query += ` difficulty = $${params.length}`;
      }
    }

    query += " ORDER BY featured DESC, created_at DESC";

    const result = await con.query(query, params);

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching training programs:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching training programs",
      error: error.message,
    });
  }
};

// Get a single training program by ID
export const getTrainingProgramById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await con.query(
      "SELECT * FROM training_programs WHERE program_id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Training program not found",
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error fetching training program:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching training program",
      error: error.message,
    });
  }
};

// Record a program download
export const recordProgramDownload = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // First verify the program exists
    const programCheck = await con.query(
      "SELECT file_url FROM training_programs WHERE program_id = $1",
      [id]
    );

    if (programCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Training program not found",
      });
    }

    // Record the download
    await con.query(
      `INSERT INTO user_program_downloads (user_id, program_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, program_id) DO UPDATE 
       SET downloaded_at = CURRENT_TIMESTAMP`,
      [userId, id]
    );

    // Return the file URL for download
    res.status(200).json({
      success: true,
      message: "Download recorded successfully",
      data: {
        file_url: programCheck.rows[0].file_url,
      },
    });
  } catch (error) {
    console.error("Error recording program download:", error);
    res.status(500).json({
      success: false,
      message: "Error recording program download",
      error: error.message,
    });
  }
};

// Create a new training program with image upload (admin only)
export const createTrainingProgram = async (req, res) => {
  try {
    console.log("Creating new training program with data:", {
      title: req.body.title,
      hasFiles: !!req.files,
      fileKeys: req.files ? Object.keys(req.files) : "none",
    });

    const {
      title,
      description,
      goal_type,
      difficulty,
      duration,
      frequency,
      file_url,
      featured,
    } = req.body;

    // Parse highlights from form data
    let highlights = [];
    for (const key in req.body) {
      if (key.startsWith("highlights[")) {
        const index = parseInt(key.match(/\[(\d+)\]/)[1]);
        highlights[index] = req.body[key];
      }
    }

    // Filter out empty highlights
    highlights = highlights.filter((item) => item && item.trim() !== "");

    // Validate required fields
    if (!title || !description || !goal_type || !file_url) {
      return res.status(400).json({
        success: false,
        message: "Title, description, goal_type, and file_url are required",
      });
    }

    let image_url = req.body.image_url || "";

    // Handle image upload if file is included
    if (req.files && req.files.image) {
      console.log("File upload detected:", req.files.image.name);

      try {
        const uploadedImage = req.files.image;
        const uniqueFileName = `${uuidv4()}_${uploadedImage.name}`;

        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(__dirname, "../uploads");
        console.log(`Using uploads directory: ${uploadsDir}`);

        if (!fs.existsSync(uploadsDir)) {
          console.log("Creating uploads directory");
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const imagePath = path.join(uploadsDir, uniqueFileName);
        console.log(`Will save image to: ${imagePath}`);

        // Move the uploaded file to our uploads directory
        await uploadedImage.mv(imagePath);
        console.log("File saved successfully");

        // Set image URL to the file path that can be accessed via HTTP
        image_url = `/uploads/${uniqueFileName}`;
        console.log(`Image URL set to: ${image_url}`);
      } catch (uploadError) {
        console.error("Error processing uploaded file:", uploadError);
        throw uploadError;
      }
    } else if (req.body.image_base64) {
      console.log("Base64 image data detected");
      // Handle base64 image data if provided
      const base64Data = req.body.image_base64.replace(
        /^data:image\/\w+;base64,/,
        ""
      );
      const uniqueFileName = `${uuidv4()}.png`;

      const uploadsDir = path.join(__dirname, "../uploads");
      console.log(`Using uploads directory for base64: ${uploadsDir}`);

      if (!fs.existsSync(uploadsDir)) {
        console.log("Creating uploads directory");
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const imagePath = path.join(uploadsDir, uniqueFileName);
      console.log(`Will save base64 image to: ${imagePath}`);

      // Write the base64 data as a file
      fs.writeFileSync(imagePath, base64Data, { encoding: "base64" });
      console.log("Base64 file saved successfully");

      // Set image URL to the file path
      image_url = `/uploads/${uniqueFileName}`;
      console.log(`Image URL set to: ${image_url}`);
    } else {
      console.log(
        "No image file or base64 data provided, using URL:",
        image_url
      );
    }

    console.log("Inserting program into database with image_url:", image_url);
    const result = await con.query(
      `INSERT INTO training_programs 
       (title, description, goal_type, difficulty, duration, frequency, image_url, file_url, featured, highlights)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        title,
        description,
        goal_type,
        difficulty || "intermediate",
        duration || "4 weeks",
        frequency || "3 days/week",
        image_url,
        file_url,
        featured === "true" || featured === true,
        highlights || [],
      ]
    );

    console.log(
      "Program created successfully with ID:",
      result.rows[0].program_id
    );
    res.status(201).json({
      success: true,
      message: "Training program created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating training program:", error);
    res.status(500).json({
      success: false,
      message: "Error creating training program",
      error: error.message,
    });
  }
};

// Update an existing training program with image handling (admin only)
export const updateTrainingProgram = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Updating training program ${id} with data:`, {
      title: req.body.title,
      hasFiles: !!req.files,
      fileKeys: req.files ? Object.keys(req.files) : "none",
    });

    const {
      title,
      description,
      goal_type,
      difficulty,
      duration,
      frequency,
      file_url,
      featured,
    } = req.body;

    // Parse highlights from form data
    let highlights = [];
    for (const key in req.body) {
      if (key.startsWith("highlights[")) {
        const index = parseInt(key.match(/\[(\d+)\]/)[1]);
        highlights[index] = req.body[key];
      }
    }

    // Filter out empty highlights
    highlights = highlights.filter((item) => item && item.trim() !== "");

    // Check if program exists
    const programCheck = await con.query(
      "SELECT * FROM training_programs WHERE program_id = $1",
      [id]
    );

    if (programCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Training program not found",
      });
    }

    let image_url = req.body.image_url || programCheck.rows[0].image_url;

    // Handle image upload if file is included
    if (req.files && req.files.image) {
      console.log("File upload detected:", req.files.image.name);

      try {
        const uploadedImage = req.files.image;
        const uniqueFileName = `${uuidv4()}_${uploadedImage.name}`;

        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(__dirname, "../uploads");
        console.log(`Using uploads directory: ${uploadsDir}`);

        if (!fs.existsSync(uploadsDir)) {
          console.log("Creating uploads directory");
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const imagePath = path.join(uploadsDir, uniqueFileName);
        console.log(`Will save image to: ${imagePath}`);

        // Move the uploaded file to our uploads directory
        await uploadedImage.mv(imagePath);
        console.log("File saved successfully");

        // Set image URL to the file path that can be accessed via HTTP
        image_url = `/uploads/${uniqueFileName}`;
        console.log(`Image URL set to: ${image_url}`);
      } catch (uploadError) {
        console.error("Error processing uploaded file:", uploadError);
        throw uploadError;
      }
    } else if (req.body.image_base64) {
      console.log("Base64 image data detected");
      // Handle base64 image data if provided
      const base64Data = req.body.image_base64.replace(
        /^data:image\/\w+;base64,/,
        ""
      );
      const uniqueFileName = `${uuidv4()}.png`;

      const uploadsDir = path.join(__dirname, "../uploads");
      console.log(`Using uploads directory for base64: ${uploadsDir}`);

      if (!fs.existsSync(uploadsDir)) {
        console.log("Creating uploads directory");
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const imagePath = path.join(uploadsDir, uniqueFileName);
      console.log(`Will save base64 image to: ${imagePath}`);

      // Write the base64 data as a file
      fs.writeFileSync(imagePath, base64Data, { encoding: "base64" });
      console.log("Base64 file saved successfully");

      // Set image URL to the file path
      image_url = `/uploads/${uniqueFileName}`;
      console.log(`Image URL set to: ${image_url}`);
    } else {
      console.log(
        "No new image provided, using existing or provided URL:",
        image_url
      );
    }

    console.log("Updating program in database with image_url:", image_url);
    // Update the program
    const result = await con.query(
      `UPDATE training_programs 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           goal_type = COALESCE($3, goal_type),
           difficulty = COALESCE($4, difficulty),
           duration = COALESCE($5, duration),
           frequency = COALESCE($6, frequency),
           image_url = $7,
           file_url = COALESCE($8, file_url),
           featured = COALESCE($9, featured),
           highlights = $10,
           updated_at = CURRENT_TIMESTAMP
       WHERE program_id = $11
       RETURNING *`,
      [
        title,
        description,
        goal_type,
        difficulty,
        duration,
        frequency,
        image_url,
        file_url,
        featured === "true" || featured === true,
        highlights,
        id,
      ]
    );

    console.log(`Program ${id} updated successfully`);
    res.status(200).json({
      success: true,
      message: "Training program updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating training program:", error);
    res.status(500).json({
      success: false,
      message: "Error updating training program",
      error: error.message,
    });
  }
};

// Delete a training program (admin only)
export const deleteTrainingProgram = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if program exists
    const programCheck = await con.query(
      "SELECT * FROM training_programs WHERE program_id = $1",
      [id]
    );

    if (programCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Training program not found",
      });
    }

    // Delete the program
    await con.query("DELETE FROM training_programs WHERE program_id = $1", [
      id,
    ]);

    res.status(200).json({
      success: true,
      message: "Training program deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting training program:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting training program",
      error: error.message,
    });
  }
};

// Get featured training program
export const getFeaturedTrainingProgram = async (req, res) => {
  try {
    const result = await con.query(
      "SELECT * FROM training_programs WHERE featured = true ORDER BY created_at DESC LIMIT 1"
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No featured training program found",
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error fetching featured training program:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching featured training program",
      error: error.message,
    });
  }
};

// Get user's downloaded programs
export const getUserDownloads = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await con.query(
      `SELECT tp.*, ud.downloaded_at
       FROM user_program_downloads ud
       JOIN training_programs tp ON ud.program_id = tp.program_id
       WHERE ud.user_id = $1
       ORDER BY ud.downloaded_at DESC`,
      [userId]
    );

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching user downloads:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user downloads",
      error: error.message,
    });
  }
};
