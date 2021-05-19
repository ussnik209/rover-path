/* eslint-disable no-restricted-syntax */
const fs = require('fs');

function Node(x, y, height) {
  this.x = x;
  this.y = y;
  this.height = height;
  this.wasDiagonal = false;

  this.isDiagonal = function isDiagonal(node) {
    if (Math.abs(this.x - node.x) === 1 && Math.abs(this.y - node.y) === 1) {
      return true;
    }
    return false;
  };
}

function Graph(gridIn, diagonal = false) {
  this.grid = [];
  this.open = [];
  this.diagonal = diagonal;

  for (let x = 0; x < gridIn.length; x += 1) {
    this.grid[x] = [];
    let node;
    for (let y = 0; y < gridIn[x].length; y += 1) {
      node = new Node(x, y, gridIn[x][y]);
      this.grid[x][y] = node;
      this.open.push(node);
    }
  }

  this.toNumeric = function toNumeric() {
    for (const row of this.grid) {
      for (const node of row) {
        if (node.height !== 'X') {
          node.height = +node.height;
        }
      }
    }
  };
}

function findManhattanDistance(x1, y1, x2, y2) {
  return Math.abs(x2 - x1) + Math.abs(y2 - y1);
}

function findChebyshevDistance(x1, y1, x2, y2) {
  return Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
}

function findNeighbors(node, graph) {
  const { grid } = graph;
  const neighbors = [];
  const { x } = node;
  const { y } = node;

  // from above
  if (grid[x] && grid[x][y - 1]) {
    neighbors.push(grid[x][y - 1]);
  }

  // from below
  if (grid[x] && grid[x][y + 1]) {
    neighbors.push(grid[x][y + 1]);
  }
  // on right
  if (grid[x - 1] && grid[x - 1][y]) {
    neighbors.push(grid[x - 1][y]);
  }

  // on left
  if (grid[x + 1] && grid[x + 1][y]) {
    neighbors.push(grid[x + 1][y]);
  }

  if (graph.diagonal) {
    // from above and left
    if (grid[x - 1] && grid[x - 1][y - 1]) {
      neighbors.push(grid[x - 1][y - 1]);
    }

    // from below and right
    if (grid[x + 1] && grid[x + 1][y + 1]) {
      neighbors.push(grid[x + 1][y + 1]);
    }
    // on below and left
    if (grid[x + 1] && grid[x + 1][y - 1]) {
      neighbors.push(grid[x + 1][y - 1]);
    }

    // on above and right
    if (grid[x - 1] && grid[x - 1][y + 1]) {
      neighbors.push(grid[x - 1][y + 1]);
    }
  }

  return neighbors.filter((itemNode) => itemNode.height !== 'X');
}

function withdrawElem(arr, elem) {
  return arr.splice(arr.indexOf(elem), 1)[0];
}

function findClosest(nodeArr) {
  let closestNode = nodeArr.find((node) => node.visited === true);
  for (let i = nodeArr.indexOf(closestNode) + 1; i < nodeArr.length - 1; i += 1) {
    const currentNode = nodeArr[i];

    if (currentNode.visited) {
      const currentNodePriority = currentNode.g + currentNode.h;
      const closestNodePriority = closestNode.g + closestNode.h;
      closestNode = currentNodePriority < closestNodePriority
        ? currentNode
        : closestNode;
    }
  }
  return closestNode;
}

function astar(start, end, graph) {
  let currentNode = withdrawElem(graph.open, start);
  const { open } = graph;

  currentNode.visited = true;
  currentNode.g = 0;
  currentNode.h = findManhattanDistance(currentNode.x, currentNode.y, end.x, end.y);

  while (open.length > 0) {
    const neighbors = findNeighbors(currentNode, graph);

    for (const neighbor of neighbors) {
      if (open.includes(neighbor)) {
        let step = 1;

        if (currentNode.isDiagonal(neighbor)) {
          if (neighbor.wasDiagonal) {
            step = 2;
            neighbor.wasDiagonal = false;
          } else {
            step = 1;
            neighbors.wasDiagonal = true;
          }
        }
        const edge = Math.abs(currentNode.height - neighbor.height) + step;
        const pathScore = currentNode.g + edge;

        if (!neighbor.visited) {
          neighbor.visited = true;
          neighbor.g = pathScore;
          neighbor.h = findChebyshevDistance(neighbor.x, neighbor.y, end.x, end.y);
          neighbor.previos = currentNode;
        } else if (pathScore < neighbor.g) {
          neighbor.g = pathScore;
          neighbor.previos = currentNode;
        }
      }
    }

    const closest = findClosest(open);

    if (closest === end) {
      return closest;
    }

    currentNode = withdrawElem(open, closest);
  }
  return -1;
}

function getPathPlan(node) {
  let curNode = node;
  const fuel = curNode.g;
  let steps = 0;
  const path = [];

  while (curNode.previos) {
    path.push(`[${curNode.x}][${curNode.y}]`);
    curNode = curNode.previos;
    steps += 1;
  }
  path.push(`[${curNode.x}][${curNode.y}]`);
  path.reverse();

  return (`${path.join('->')}
steps: ${steps}
fuel: ${fuel}`);
}

function calculateRoverPath(map) {
  const graph = new Graph(map, true);
  graph.toNumeric();
  const start = graph.grid[0][0];
  const end = graph.grid[map.length - 1][map[0].length - 1];
  const resultNode = astar(start, end, graph);

  const pathPlan = getPathPlan(resultNode);
  fs.writeFileSync('path-plan.txt', pathPlan);
}

module.exports = {
  calculateRoverPath,
};
