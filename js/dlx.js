/* Matrix(int width)
 *    Class implementing Donald Knuth's dancing links algorithm to solve the
 *    exact cover
 * <- width: width of the rows in the matrix
 *
 * PUBLIC METHODS --
 *
 * solve() -> T[]
 *    Solves the exact cover represented by the matrix
 * -> Array of values associated with each row of the solution
 *
 * addRow(T val, int[] pos)
 *    Inserts a row into the DLX matrix
 * <- val: Value associated with the row
 * <- pos: Positions of covered items in the row */
function Matrix(width) {
   "use strict";

   var row = [], soln = [], root;

   // encapsulate the constructor
   (function () {
      var first = {}, curr = first, prev = first, i;

      // build the header row
      for (i = 0; i < width; i += 1) {
         curr.prev = prev;
         prev.next = curr;
         curr.up = curr;
         curr.down = curr;
         curr.head = curr;
         row.push(curr);
         prev = curr;
         curr = {};
      }

      // attach the root node
      root = curr;
      prev.next = root;
      root.prev = prev;
      root.next = first;
      first.prev = root;
   }());

   function getCol() {
      var result = null, count = -1, head, c, n;

      // search for the column with minimum nodes
      for (head = root.next; head !== root; head = head.next) {
         // count the nodes
         c = 0;
         for (n = head.down; n !== head; n = n.down) {
            c += 1;
         }

         // if the column is empty, pick it
         if (!c) {
            return head;
         }

         // check for a new minimum
         if (count === -1 || c < count) {
            count = c;
            result = head;
         }
      }

      return result;
   }

   function coverCol(head) {
      var x, y;

      // unlink the header
      head.prev.next = head.next;
      head.next.prev = head.prev;

      // unlink rows
      for (y = head.down; y !== head; y = y.down) {
         for (x = y.next; x !== y; x = x.next) {
            x.up.down = x.down;
            x.down.up = x.up;
         }
      }
   }

   function uncoverCol(head) {
      var x, y;

      // link the header
      head.prev.next = head;
      head.next.prev = head;

      // link the rows
      for (y = head.down; y !== head; y = y.down) {
         for (x = y.next; x !== y; x = x.next) {
            x.up.down = x;
            x.down.up = x;
         }
      }
   }

   //
   // PUBLIC METHODS --
   //

   this.solve = function () {
      var head = getCol(), n, x, s;

      // check if there are any headers left
      if (!head) {
         // no headers left, we have a solution
         return soln;
      }

      // cover the column we've selected
      coverCol(head);

      // try each item in the column
      for (n = head.down; n !== head; n = n.down) {
         // cover the selected item's row
         for (x = n.next; x !== n; x = x.next) {
            coverCol(x.head);
         }

         // push temporary solution
         soln.push(n.r);

         // try to solve recursively
         s = this.solve();

         // if we found a solution, return it;
         if (s) {
            return s;
         }

         // bad selection, pop it and keep going
         soln.pop();

         // uncover the selected item's row
         for (x = n.next; x !== n; x = x.next) {
            uncoverCol(x.head);
         }
      }

      // bad column selection, uncover it and return null
      uncoverCol(head);

      return null;
   };

   this.addRow = function (val, pos) {
      var first = { r: val }, curr = first, prev = first, x, i;

      // build the row
      for (i = 0; i < pos.length; i += 1) {
         x = row[pos[i]];
         curr.prev = prev;
         prev.next = curr;
         curr.up = x;
         curr.down = x.down;
         curr.head = x.head;
         x.down = curr;
         curr.down.up = curr;
         row[pos[i]] = curr;
         prev = curr;
         curr = { r: val };
      }

      // fix up links
      prev.next = first;
      first.prev = prev;
   };
}

/* solveSudoku(int k, int[][] vals) -> int[][]
 *    Given a Sudoku puzzle of a given size, attempts to find a solution
 * <- k: Square root of the width of the Sudoku grid
 * <- vals: Table of values on the Sudoku grid
 * -> Solved grid, or null if no solution */
function solveSudoku(k, vals) {
   "use strict";

   // we need a whole royal mess of variables
   var n = k * k, xOff = n * n, yOff = 2 * xOff, bOff = yOff + xOff,
       m = new Matrix(bOff + xOff), soln = null, result,
       i, x, y;

   // adds a sudoku cell to the matrix
   function addVal(vx, vy, vval) {
      // convert sudoku data to an exact cover row
      var bNum = k * ((vy - vy % k) / k) + (vx - vx % k) / k,
          data = [ n * vy + vx,
                   xOff + (n * vx + vval),
                   yOff + (n * vy + vval),
                   bOff + (n * bNum + vval) ];

      // add row to the matrix
      m.addRow({ x: vx, y: vy, val: vval + 1}, data);
   }

   // add all the cells in the array to the matrix
   for (x = 0; x < n; x += 1) {
      for (y = 0; y < n; y += 1) {
         if (0 < vals[x][y] && vals[x][y] <= n) {
            addVal(x, y, vals[x][y] - 1);
         } else {
            for (i = 0; i < n; i += 1) {
               addVal(x, y, i);
            }
         }
      }
   }

   // find the exact cover
   result = m.solve();

   // if successful, translate exact cover solution back to a sudoku grid
   if (result) {
      // build our table
      soln = [];

      for (i = 0; i < n; i += 1) {
         soln.push([]);
      }

      // fill the table with the results
      for (i = 0; i < result.length; i += 1) {
         soln[result[i].x][result[i].y] = result[i].val;
      }
   }

   return soln;
}
