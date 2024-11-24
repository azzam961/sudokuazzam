import React, { useState, useEffect } from 'react';
import './style.css';
import Tesseract from 'tesseract.js';

const Sudoku = () => {
  const easyBoard = [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9]
  ];
  const mediumBoard = [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 0, 0]
  ];

  const hardBoard = [
    [5, 0, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 0, 0, 0, 0],
    [0, 9, 0, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 0, 0, 0, 0, 3],
    [0, 0, 0, 8, 0, 0, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 0],
    [0, 6, 0, 0, 0, 0, 0, 8, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 0, 9]
  ];

  const solution = [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9]
  ];

  const [board, setBoard] = useState(easyBoard); // Default to Easy
  const [image, setImage] = useState(null);
  const [ocrText, setOcrText] = useState("");
  const [isSolving, setIsSolving] = useState(false);
  const [showPopup, setShowPopup] = useState(false); // State for showing the success popup

  // Helper function to solve the Sudoku puzzle (backtracking algorithm)
  const solveSudoku = (board) => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (isValid(board, row, col, num)) {
              board[row][col] = num;

              if (solveSudoku(board)) {
                return true;
              }

              board[row][col] = 0; // Backtrack
            }
          }
          return false;
        }
      }
    }
    return true;
  };

  const isValid = (board, row, col, num) => {
    for (let i = 0; i < 9; i++) {
      if (board[row][i] === num || board[i][col] === num) {
        return false;
      }
    }

    const boxRowStart = Math.floor(row / 3) * 3;
    const boxColStart = Math.floor(col / 3) * 3;

    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (board[boxRowStart + r][boxColStart + c] === num) {
          return false;
        }
      }
    }

    return true;
  };

  // Function to trigger the solving process
  const solveBoard = () => {
    setIsSolving(true);
    const boardCopy = JSON.parse(JSON.stringify(board)); // Make a copy of the current board
    if (solveSudoku(boardCopy)) {
      setBoard(boardCopy);
    } else {
      alert("No solution found!");
    }
    setIsSolving(false);
  };

  // Function to handle image file selection and OCR processing
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));

      // Perform OCR to extract numbers
      Tesseract.recognize(
        file,
        'eng',
        {
          logger: (m) => console.log(m),
        }
      ).then(({ data: { text } }) => {
        setOcrText(text);
        extractBoardFromText(text);
      });
    }
  };

  // Function to check if the current board matches the solution
  const checkCompletion = () => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] !== solution[row][col]) {
          return false; // If any number is incorrect, return false
        }
      }
    }
    return true; // All numbers are correct
  };

  // Function to give a hint by filling a random empty cell with the correct value
  const giveHint = () => {
    let emptyCells = [];
    // Find all empty cells (those with value 0)
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) {
          emptyCells.push({ row, col });
        }
      }
    }

    if (emptyCells.length > 0) {
      const randomIndex = Math.floor(Math.random() * emptyCells.length);
      const { row, col } = emptyCells[randomIndex];
      const boardCopy = JSON.parse(JSON.stringify(board));
      const correctValue = solution[row][col]; // Get the correct value from the solution
      boardCopy[row][col] = correctValue; // Fill the cell with the correct value
      setBoard(boardCopy);
    }
  };

  // Function to extract board numbers from OCR text and map to the board
  const extractBoardFromText = (text) => {
    const lines = text.split('\n');
    const extractedBoard = [];
    for (let i = 0; i < 9; i++) {
      const row = [];
      const numbers = lines[i].split(' ').filter(num => num.trim() !== '');
      for (let j = 0; j < 9; j++) {
        row.push(parseInt(numbers[j], 10) || 0); // If no number found, set as 0
      }
      extractedBoard.push(row);
    }
    setBoard(extractedBoard);
  };

  // Reset the board to the initial state and hide the popup
  const resetBoard = (boardType = easyBoard) => {
    setBoard(boardType);
    setShowPopup(false); // Hide success popup when starting a new game
  };

  useEffect(() => {
    if (checkCompletion()) {
      setShowPopup(true); // Show success popup if board is correct
    }
  }, [board]);

  return (
    <div className="sudoku-container">
      <h2>Sudoku Solver</h2>

      {/* Image upload functionality */}
      <div className="image-upload">
        <input type="file" accept="image/*" onChange={handleImageUpload} />
        {image && <img src={image} alt="Uploaded Sudoku" />}
      </div>

      <div className="difficulty-buttons">
        <button onClick={() => resetBoard(easyBoard)}>Easy</button>
        <button onClick={() => resetBoard(mediumBoard)}>Medium</button>
        <button onClick={() => resetBoard(hardBoard)}>Hard</button>
      </div>

      <div className="sudoku-board">
        {board.map((row, rowIndex) => (
          row.map((cell, colIndex) => (
            <input
              key={`${rowIndex}-${colIndex}`}
              type="number"
              value={cell === 0 ? '' : cell}
              onChange={(e) => {
                const newBoard = [...board];
                newBoard[rowIndex][colIndex] = parseInt(e.target.value, 10) || 0;
                setBoard(newBoard);
              }}
            />
          ))
        ))}
      </div>

      <div className="buttons">
        <button className="solve-button" onClick={solveBoard} disabled={isSolving}>
          {isSolving ? "Solving..." : "Solve"}
        </button>
        <button className="hint-button" onClick={giveHint}>
          Give Hint
        </button>
        <div className='btn-newgame'>
        <button className="new-game-button" onClick={() => resetBoard()}>
          New Game
        </button>
        </div>
      </div>

      {/* Success Popup */}
      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h3>Congratulations! You've completed the puzzle successfully!</h3>
            <button onClick={() => setShowPopup(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sudoku;
