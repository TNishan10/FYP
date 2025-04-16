import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import moment from "moment";

export const downloadProgramAsPdf = async (
  program,
  exercises,
  setDownloadingId,
  unsetDownloadingId
) => {
  try {
    if (setDownloadingId) setDownloadingId(program.program_id);

    // Create a temporary element to render the program
    const element = document.createElement("div");
    element.style.position = "absolute";
    element.style.left = "-9999px";
    element.style.top = "-9999px";
    element.style.width = "794px"; // A4 width in pixels at 96 DPI

    // Format goal type with spaces and title case
    const formatGoalType = (goalType) => {
      if (!goalType) return "N/A";
      return goalType
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    };

    // Format difficulty to be title case
    const formatDifficulty = (difficulty) => {
      if (!difficulty) return "N/A";
      return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
    };

    // Format date
    const formatDate = (dateString) => {
      if (!dateString) return "N/A";
      return moment(dateString).format("MMMM D, YYYY");
    };

    // Format highlights text safely
    const formatHighlights = (highlights) => {
      if (!highlights) return "";
      if (typeof highlights === "string") {
        return highlights.replace(/\n/g, "<br>");
      }
      return String(highlights);
    };

    // Check if program has workout days
    const hasWorkoutDays =
      program.workout_days && program.workout_days.length > 0;

    // Generate workout days HTML
    let workoutDaysHtml = "";

    if (hasWorkoutDays) {
      workoutDaysHtml = program.workout_days
        .map((day) => {
          // Create exercises table for this day
          const exercisesTable =
            day.exercises && day.exercises.length > 0
              ? `
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 10px;">
              <thead>
                <tr style="background-color: #f5f5f5;">
                  <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Movement</th>
                  <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Sets</th>
                  <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Reps</th>
                  <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Weight</th>
                  <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">RPE</th>
                  <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Tempo</th>
                  <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Rest</th>
                </tr>
              </thead>
              <tbody>
                ${day.exercises
                  .map(
                    (ex) => `
                  <tr>
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: 600;">${
                      ex.movement || "N/A"
                    }</td>
                    <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${
                      ex.sets || "-"
                    }</td>
                    <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${
                      ex.reps || "-"
                    }</td>
                    <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${
                      ex.weight_used || "-"
                    }</td>
                    <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${
                      ex.actual_rpe || "-"
                    }</td>
                    <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${
                      ex.tempo || "-"
                    }</td>
                    <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${
                      ex.rest || "-"
                    }</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          `
              : '<p style="color: #666; font-style: italic;">No exercises for this day.</p>';

          // Create day section with header, notes and exercises
          return `
          <div style="margin-bottom: 30px; padding: 15px; border: 1px solid #eaeaea; border-radius: 6px;">
            <div style="display: flex; align-items: center; margin-bottom: 15px; border-bottom: 1px solid #f0f0f0; padding-bottom: 10px;">
              <div style="font-size: 16px; font-weight: bold; color: #1a1a1a;">
                ${day.day_name || "Workout Day"} - ${formatDate(
            day.workout_date
          )}
              </div>
            </div>
            
            ${
              day.notes
                ? `
              <div style="margin-bottom: 15px; padding: 10px; background-color: #fffbe6; border-radius: 4px; font-size: 13px; font-style: italic;">
                <strong>Coach's Notes:</strong> ${day.notes}
              </div>
            `
                : ""
            }
            
            ${exercisesTable}
          </div>
        `;
        })
        .join("");
    } else if (exercises && exercises.length > 0) {
      // Fallback for old format with flat exercise list
      workoutDaysHtml = `
        <div style="margin-bottom: 30px;">
          <h2 style="font-size: 18px; color: #1a1a1a; margin-bottom: 16px;">Program Exercises</h2>
          
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
              <tr style="background-color: #f5f5f5;">
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Movement</th>
                <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Sets</th>
                <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Reps</th>
                <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Weight</th>
                <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">RPE</th>
                <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Tempo</th>
                <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Rest</th>
              </tr>
            </thead>
            <tbody>
              ${exercises
                .map(
                  (ex) => `
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd; font-weight: 600;">${
                    ex.movement || "N/A"
                  }</td>
                  <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${
                    ex.sets || "-"
                  }</td>
                  <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${
                    ex.reps || "-"
                  }</td>
                  <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${
                    ex.weight_used || "-"
                  }</td>
                  <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${
                    ex.actual_rpe || "-"
                  }</td>
                  <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${
                    ex.tempo || "-"
                  }</td>
                  <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${
                    ex.rest || "-"
                  }</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>
      `;
    } else {
      workoutDaysHtml =
        '<p style="color: #666;">No exercises found for this program.</p>';
    }

    // Create program content with proper styling
    element.innerHTML = `
      <div style="font-family: Arial, sans-serif; padding: 40px; color: #333;">
        <div style="text-align: center; margin-bottom: 30px; padding: 20px; background-color: #1a1a1a; color: white;">
          <div style="font-size: 18px; font-weight: bold;">OX-FIT</div>
          <div style="width: 40px; height: 2px; background-color: rgba(255,255,255,0.5); margin: 8px auto;"></div>
          <h1 style="font-size: 24px; font-weight: bold; margin: 0;">${
            program.title || "Training Program"
          }</h1>
          <div style="font-size: 12px; margin-top: 8px;">Program #${
            program.program_id
          }</div>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h2 style="font-size: 18px; color: #1a1a1a; border-bottom: 2px solid #f0f0f0; padding-bottom: 8px; margin-bottom: 16px;">Program Overview</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #333; margin-bottom: 20px;">
            ${program.description || "No description provided."}
          </p>
          
          <div style="display: flex; flex-wrap: wrap; gap: 15px; margin-top: 20px;">
            <div style="flex: 1; min-width: 200px; background-color: #f5f5f5; padding: 15px; border-radius: 6px;">
              <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Goal Type</div>
              <div style="font-size: 14px; color: #1a1a1a; font-weight: 600;">${formatGoalType(
                program.goal_type
              )}</div>
            </div>
            <div style="flex: 1; min-width: 200px; background-color: #f5f5f5; padding: 15px; border-radius: 6px;">
              <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Difficulty Level</div>
              <div style="font-size: 14px; color: #1a1a1a; font-weight: 600;">${formatDifficulty(
                program.difficulty || program.difficulty_level
              )}</div>
            </div>
            <div style="flex: 1; min-width: 200px; background-color: #f5f5f5; padding: 15px; border-radius: 6px;">
              <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Duration</div>
              <div style="font-size: 14px; color: #1a1a1a; font-weight: 600;">${
                program.duration_weeks || program.duration || "N/A"
              } weeks</div>
            </div>
            <div style="flex: 1; min-width: 200px; background-color: #f5f5f5; padding: 15px; border-radius: 6px;">
              <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Frequency</div>
              <div style="font-size: 14px; color: #1a1a1a; font-weight: 600;">${
                program.frequency || "N/A"
              }</div>
            </div>
          </div>
        </div>
        
        ${
          program.highlights
            ? `
        <div style="margin-bottom: 30px;">
          <h2 style="font-size: 18px; color: #1a1a1a; border-bottom: 2px solid #f0f0f0; padding-bottom: 8px; margin-bottom: 16px;">Program Highlights</h2>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; font-size: 14px; line-height: 1.6;">
            ${formatHighlights(program.highlights)}
          </div>
        </div>
        `
            : ""
        }
        
        <div style="margin-bottom: 30px;">
          <h2 style="font-size: 18px; color: #1a1a1a; border-bottom: 2px solid #f0f0f0; padding-bottom: 8px; margin-bottom: 16px;">
            ${
              hasWorkoutDays ? "Training Program Schedule" : "Program Exercises"
            }
          </h2>
          
          ${workoutDaysHtml}
        </div>
        
        <div style="text-align: center; margin-top: 40px; color: #666; font-size: 12px;">
          <div style="margin-bottom: 10px;">
            © ${new Date().getFullYear()} OX-Fit - All Rights Reserved
          </div>
          <div style="height: 1px; background-color: #e5e7eb; margin: 10px 0;"></div>
          <div>
            This program was generated for personal use. 
            Consult with a fitness professional before starting any exercise regimen.
          </div>
        </div>
      </div>
    `;

    // Append element to the body
    document.body.appendChild(element);

    try {
      // Generate PDF using html2canvas and jsPDF
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      // PDF configuration
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const width = pdf.internal.pageSize.getWidth();
      const height = pdf.internal.pageSize.getHeight();

      // Add image to PDF (scaled to fit A4)
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(width / imgWidth, height / imgHeight);
      const imgX = (width - imgWidth * ratio) / 2;
      const imgY = 0;

      pdf.addImage(
        imgData,
        "PNG",
        imgX,
        imgY,
        imgWidth * ratio,
        imgHeight * ratio
      );

      // If content is too long for one page, add more pages
      if (imgHeight * ratio > height) {
        const pageCount = Math.ceil((imgHeight * ratio) / height);

        for (let i = 1; i < pageCount; i++) {
          pdf.addPage();
          pdf.addImage(
            imgData,
            "PNG",
            imgX,
            -height * i,
            imgWidth * ratio,
            imgHeight * ratio
          );
        }
      }

      // Generate filename based on program details
      const programTitle = program.title
        ? program.title.replace(/[^a-zA-Z0-9]/g, "_")
        : "Training_Program";
      const fileName = `OX-FIT_${programTitle}_${program.program_id}.pdf`;

      // Save PDF
      pdf.save(fileName);

      return true;
    } finally {
      // Clean up - remove the element
      if (element && document.body.contains(element)) {
        document.body.removeChild(element);
      }

      // Reset downloading state
      if (unsetDownloadingId) unsetDownloadingId(program.program_id);
    }
  } catch (error) {
    console.error("Error generating PDF:", error);
    if (unsetDownloadingId) unsetDownloadingId(program.program_id);
    return false;
  }
};
