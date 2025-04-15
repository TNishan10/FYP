import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Get current file directory (needed for ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Generate a PDF for a training program
 * @param {Object} program - The training program data
 * @param {string} outputPath - Optional path to save the PDF file
 * @returns {Promise<Buffer|string>} - PDF buffer or file path if saved
 */
export const generateTrainingProgramPdf = async (
  program,
  outputPath = null
) => {
  return new Promise((resolve, reject) => {
    try {
      // Create a document
      const doc = new PDFDocument({ margin: 50 });
      let buffers = [];

      // If outputPath provided, write to file
      if (outputPath) {
        doc.pipe(fs.createWriteStream(outputPath));
      }

      // Collect the PDF data in memory if we're not writing to a file
      doc.on("data", (buffer) => buffers.push(buffer));

      // Header with logo
      doc
        .fontSize(25)
        .font("Helvetica-Bold")
        .text("OX-FIT", { align: "center" });
      doc.moveDown();
      doc
        .fontSize(20)
        .text(`Training Program: ${program.title}`, { align: "center" });
      doc.moveDown();

      // Program details
      doc.fontSize(12).font("Helvetica");
      doc.text(`Goal: ${program.goal_type || "General Fitness"}`);
      doc.text(`Difficulty: ${program.difficulty || "All Levels"}`);
      doc.moveDown();

      // Description
      if (program.description) {
        doc.font("Helvetica-Bold").text("Description:");
        doc.font("Helvetica").text(program.description);
        doc.moveDown();
      }

      // Exercises table
      if (program.exercises && program.exercises.length > 0) {
        doc.font("Helvetica-Bold").text("Workout Program", { align: "center" });
        doc.moveDown();

        // Calculate column widths
        const pageWidth =
          doc.page.width - doc.page.margins.left - doc.page.margins.right;

        // Table header
        const headers = [
          "Movement",
          "Intensity",
          "Weight",
          "RPE",
          "Sets",
          "Reps",
          "Tempo",
          "Rest",
          "Notes",
        ];

        const columnWidths = {
          movement: pageWidth * 0.2,
          intensity: pageWidth * 0.1,
          weight: pageWidth * 0.1,
          rpe: pageWidth * 0.05,
          sets: pageWidth * 0.05,
          reps: pageWidth * 0.05,
          tempo: pageWidth * 0.1,
          rest: pageWidth * 0.1,
          notes: pageWidth * 0.25,
        };

        // Draw header row
        doc.font("Helvetica-Bold");
        let xPos = doc.x;
        headers.forEach((header, i) => {
          const width = Object.values(columnWidths)[i];
          doc.text(header, xPos, doc.y, { width, align: "center" });
          xPos += width;
        });
        doc.moveDown();

        // Draw exercises rows
        doc.font("Helvetica");
        program.exercises.forEach((exercise) => {
          // Check if we need a new page
          if (doc.y > doc.page.height - 150) {
            doc.addPage();
          }

          xPos = doc.x;

          // Movement name
          doc.text(exercise.movement || "-", xPos, doc.y, {
            width: columnWidths.movement,
            align: "left",
          });
          xPos += columnWidths.movement;

          // Intensity
          doc.text(exercise.intensity || "-", xPos, doc.y, {
            width: columnWidths.intensity,
            align: "center",
          });
          xPos += columnWidths.intensity;

          // Weight
          doc.text(exercise.weight || "-", xPos, doc.y, {
            width: columnWidths.weight,
            align: "center",
          });
          xPos += columnWidths.weight;

          // RPE
          doc.text(exercise.rpe?.toString() || "-", xPos, doc.y, {
            width: columnWidths.rpe,
            align: "center",
          });
          xPos += columnWidths.rpe;

          // Sets
          doc.text(exercise.sets?.toString() || "-", xPos, doc.y, {
            width: columnWidths.sets,
            align: "center",
          });
          xPos += columnWidths.sets;

          // Reps
          doc.text(exercise.reps?.toString() || "-", xPos, doc.y, {
            width: columnWidths.reps,
            align: "center",
          });
          xPos += columnWidths.reps;

          // Tempo
          doc.text(exercise.tempo || "-", xPos, doc.y, {
            width: columnWidths.tempo,
            align: "center",
          });
          xPos += columnWidths.tempo;

          // Rest
          doc.text(exercise.rest || "-", xPos, doc.y, {
            width: columnWidths.rest,
            align: "center",
          });
          xPos += columnWidths.rest;

          // Notes
          const currentY = doc.y;
          doc.text(exercise.notes || "-", xPos, doc.y, {
            width: columnWidths.notes,
            align: "left",
          });

          // Move to next row
          doc.moveDown();
        });
      }

      // Footer with date
      const bottomOfPage = doc.page.height - doc.page.margins.bottom;
      doc
        .font("Helvetica")
        .fontSize(10)
        .text(
          `Generated on ${new Date().toLocaleDateString()}`,
          doc.page.margins.left,
          bottomOfPage - 20,
          { align: "center" }
        );

      // Finalize the PDF
      doc.end();

      // If writing to a file, resolve with the path
      if (outputPath) {
        doc.on("end", () => resolve(outputPath));
      } else {
        // Otherwise resolve with the buffer
        doc.on("end", () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Generate and save a PDF file for a training program
 * @param {Object} program - The training program data
 * @param {string} [filename] - Optional custom filename
 * @returns {Promise<string>} - Path to the generated PDF file
 */
export const saveTrainingProgramPdf = async (program, filename = null) => {
  try {
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.resolve(process.cwd(), "uploads", "pdfs");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate filename
    const pdfFilename =
      filename || `program_${program.program_id}_${Date.now()}.pdf`;
    const outputPath = path.join(uploadsDir, pdfFilename);

    // Generate and save the PDF
    await generateTrainingProgramPdf(program, outputPath);

    return outputPath;
  } catch (error) {
    console.error("Error saving PDF:", error);
    throw error;
  }
};

export default {
  generateTrainingProgramPdf,
  saveTrainingProgramPdf,
};
