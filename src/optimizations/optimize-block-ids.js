const Optimization = require('./optimization');

const SOUP = [
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  '!', '#', '%', '(', ')', '*', '+', ',', '-', '.', '/', ':', ';', '=', '?', '@', '[', ']', '^', '_', '`', '{', '|', '}', '~',
];
const generateId = (i) => {
  if (i < SOUP.length) {
    return SOUP[i];
  }
  return `${generateId(Math.floor(i / SOUP.length) - 1)}${SOUP[i % SOUP.length]}`;
};

class BlockIdPool {
  constructor() {
    this.cache = new Map();
    this.counter = 0;
  }
  get(originalId) {
    const stored = this.cache.get(originalId);
    if (stored) return stored;
    const newId = generateId(this.counter);
    this.cache.set(originalId, newId);
    this.counter++;
    return newId;
  }
}

class OptimizeBlockIDs extends Optimization {
  run() {
    const pool = new BlockIdPool();
    for (const target of this.project.projectData.targets) {
      const newBlocks = {};
      for (const blockId of Object.keys(target.blocks)) {
        const block = target.blocks[blockId];
        newBlocks[pool.get(blockId)] = block;
        if (block.parent) {
          block.parent = pool.get(block.parent);
        }
        if (block.next) {
          block.next = pool.get(block.next);
        }
        if (block.inputs) {
          for (const inputName of Object.keys(block.inputs)) {
            const input = block.inputs[inputName];
            const inputValue = input[1];
            if (typeof inputValue === 'string') {
              input[1] = pool.get(inputValue);
            }
          }
        }
      }
      for (const commentId of Object.keys(target.comments)) {
        const comment = target.comments[commentId];
        if (comment.blockId) {
          comment.blockId = pool.get(comment.blockId);
        }
      }
      target.blocks = newBlocks;
    }
  }
}

module.exports = OptimizeBlockIDs;
