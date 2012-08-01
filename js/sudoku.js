/* OutputBox(int k)
 *    Class to display and control the solution of a Sudoku puzzle
 * <- int k: Square root of the width of the grid
 *
 * PUBLIC METHODS --
 *
 * setVals(int vals[][])
 *    Updates the display to show the given solution grid
 * <- int[][] vals: Table of values to display
 *
 * getElement() -> Element
 *    Retrieves the DOM element for the display
 * -> DOM element for the Sudoku solution grid */
function OutputBox(k) {
   "use strict";

   var n = k * k, x, y, col, row, cells = [],
       tab = document.createElement('table');

   // initialize the cell grid
   for (x = 0; x < n; x += 1) {
      cells[x] = [];
   }

   // creates a k*k output box area
   function makeOutputBox(b) {
      var tab = document.createElement('table'), row, col, cell, x, y;
      tab.className = 'box';

      // create the rows
      for (y = 0; y < k; y += 1) {
         row = document.createElement('tr');

         // create the columns
         for (x = 0; x < k; x += 1) {
            col = document.createElement('td');

            // build the output cell
            cell = document.createElement('input');
            cell.setAttribute('type', 'text');
            cell.setAttribute('size', '1');
            cell.setAttribute('readonly', 'readonly'); // not editable

            col.appendChild(cell);
            row.appendChild(col);

            // link the output cell into the class grid
            cells[(b % k) * k + x][(b - b % k) + y] = cell;
         }

         tab.appendChild(row);
      }

      return tab;
   }

   // construct all the k*k boxes
   for (y = 0; y < k; y += 1) {
      row = document.createElement('tr');
      for (x = 0; x < k; x += 1) {
         col = document.createElement('td');
         col.appendChild(makeOutputBox(y * k + x));
         row.appendChild(col);
      }
      tab.appendChild(row);
   }

   //
   // PUBLIC METHODS --
   // 

   this.setVals = function (vals) {
      var x, y, v;

      // update the cells based on what we were given
      for (x = 0; x < n; x += 1) {
         for (y = 0; y < n; y += 1) {
            // update if the value is in the right range,
            // otherwise clear the cell
            v = vals[x][y];
            if (v && v <= n) {
               cells[x][y].value = vals[x][y];
            } else {
               cells[x][y].value = '';
            }
         }
      }
   };

   this.getElement = function () {
      return tab;
   };
}

/* InputBox(int k)
 *    Class to display and control the input of a Sudoku puzzle
 * <- int k: Square root of the width of the grid
 *
 * PUBLIC METHODS --
 *
 * getVals() -> int[][]
 *    Retrieves the values entered into the grid
 * -> Table of values in the input grid
 *
 * clear()
 *    Removes all values from the display
 *
 * getElement() -> Element
 *    Retrieves the DOM element for the display
 * -> DOM element for the Sudoku input grid */
function InputBox(k) {
   "use strict";

   var n = k * k, x, y, row, col, cells = [],
       tab = document.createElement('table');

   // initialize the cell grid
   for (x = 0; x < n; x += 1) {
      cells[x] = [];
   }

   // check if key pressed is a number
   function isNumber(e) {
      var charCode = e.which || e.keyCode;
      return !(charCode < 48 || charCode > 57);
   }

   // creates a validator function for a cell that'll set it's class to
   // "sudoku_error" if it's value is invalid
   function makeValidator(cell) {
      return function () {
         var val;
         if (cell.value) {
            val = parseInt(cell.value, 10);
            if (!val || val > n) {
               cell.className = 'sudoku_error';
            } else {
               cell.className = '';
            }
         }
      };
   }

   // creates a k*k input box area
   function makeInputBox(b) {
      var tab = document.createElement('table'), row, col, cell, x, y;
      tab.className = 'box';

      // create the rows
      for (y = 0; y < k; y += 1) {
         row = document.createElement('tr');

         // create the columns
         for (x = 0; x < k; x += 1) {
            col = document.createElement('td');

            // build the input cell
            cell = document.createElement('input');
            cell.setAttribute('type', 'text');
            cell.setAttribute('size', '1');
            cell.onkeypress = isNumber;
            cell.onchange = makeValidator(cell);

            col.appendChild(cell);
            row.appendChild(col);

            // link the input cell into the class grid
            cells[(b % k) * k + x][(b - b % k) + y] = cell;
         }

         tab.appendChild(row);
      }

      return tab;
   }

   // construct all the k*k boxes
   for (y = 0; y < k; y += 1) {
      row = document.createElement('tr');
      for (x = 0; x < k; x += 1) {
         col = document.createElement('td');
         col.appendChild(makeInputBox(y * k + x));
         row.appendChild(col);
      }
      tab.appendChild(row);
   }

   this.getVals = function () {
      var vals = [], x, y, txt, v;

      // construct the output grid
      for (x = 0; x < n; x += 1) {
         vals[x] = [];
      }

      // add the values from the grid to the output
      for (y = 0; y < n; y += 1) {
         for (x = 0; x < n; x += 1) {
            txt = cells[x][y].value;

            // check if the cell has any contents at all
            if (txt) {
               v = parseInt(txt, 10);

               // make sure the cell is valid,
               // otherwise ignore it and clear it
               if (v && v <= n) {
                  vals[x][y] = v;
               } else {
                  vals[x][y] = 0;
                  cells[x][y].value = '';
                  cells[x][y].className = '';
               }
            } else {
               // cell is empty
               vals[x][y] = 0;
            }
         }
      }

      return vals;
   };

   this.clear = function () {
      // blank out all the cells
      for (x = 0; x < n; x += 1) {
         for (y = 0; y < n; y += 1) {
            cells[x][y].value = '';
            cells[x][y].className = '';
         }
      }
   };

   this.getElement = function () {
      return tab;
   };
}

/* sudokuGrid(int k, (solver(int k, int[][] vals) -> int[][])) -> Element
 *    Creates a Sudoku solver Element of the given size, using the given
 *    solver function as the backend
 * <- k: Square root of the width of the grid
 * <- solver: Solver function (see sudokuSolver in file dlx.js)
 * -> DOM element to display the solver frontend */
function sudokuGrid(k, solver) {
   "use strict";

   // construct the DOM elements
   var inHead = document.createElement('h2'),
       outHead = document.createElement('h2'),
       div = document.createElement('div'),
       solve = document.createElement('input'),
       reset = document.createElement('input'),
       inBox = new InputBox(k),
       outBox = new OutputBox(k),
       out = null;

   // set up the solve button
   solve.setAttribute('type', 'button');
   solve.setAttribute('value', 'Solve');
   solve.className = "sudoku_button";

   // set up the reset button
   reset.setAttribute('type', 'button');
   reset.setAttribute('value', 'Reset');
   reset.className = "sudoku_button";

   // add headers
   inHead.appendChild(document.createTextNode("Input"));
   outHead.appendChild(document.createTextNode("Solution"));

   // setup div and add everything to it
   div.className = "sudoku"
   div.appendChild(inHead);
   div.appendChild(inBox.getElement());
   div.appendChild(solve);
   div.appendChild(reset);

   // handler for solve button
   solve.onclick = function () {
      // try to solve whatever's in the input area
      var vals = solver(k, inBox.getVals()), output;

      // check if a solution was found
      if (vals) {
         // set the output area to the solution grid
         outBox.setVals(vals);
         output = document.createElement('div');
         output.appendChild(outHead);
         output.appendChild(outBox.getElement());
      } else {
         // no solution, tell the user
         output = document.createElement('div');
         output.appendChild(document.createTextNode('No solution'));
      }

      // remove the old output area if there is one
      if (out) {
         div.removeChild(out);
      }

      // add in the new output area
      div.appendChild(output);
      out = output;
      out.className = "sudoku_output";
   };

   // handler for reset button
   reset.onclick = function () {
      // eliminate the output area
      if (out) {
         div.removeChild(out);
         out = null;
      }

      // clear out the input area
      inBox.clear();
   };

   return div;
}
