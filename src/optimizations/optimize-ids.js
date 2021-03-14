const Optimization = require('./optimization');

const SOUP = [
  // TODO: I suspect we can increase this quite a bit more
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

class IdPool {
  constructor() {
    this.generatedIds = new Map();
    this.references = new Map();
  }
  addReference(id) {
    const currentCount = this.references.get(id) || 0;
    this.references.set(id, currentCount + 1);
  }
  generateNewIds() {
    const entries = Array.from(this.references.entries());
    // Sort descending by count.
    // The most used original IDs should get the shortest new IDs.
    entries.sort((a, b) => b[1] - a[1]);
    for (let i = 0; i < entries.length; i++) {
      this.generatedIds.set(entries[i][0], generateId(i));
    }
  }
  getNewId(originalId) {
    if (this.generatedIds.has(originalId)) {
      return this.generatedIds.get(originalId);
    }
    console.trace('Unknown id: ' + originalId);
    return originalId;
  }
}

class OptimizeIDs extends Optimization {
  run() {
    const targetPools = new Map();
    const variablePool = new IdPool();
    for (const monitor of this.project.projectData.monitors) {
      const monitorId = monitor.id;
      variablePool.addReference(monitorId);
    }
    for (const target of this.project.projectData.targets) {
      const blockPool = new IdPool();
      const commentPool = new IdPool();
      targetPools.set(target, {
        blockPool,
        commentPool
      });

      const handleCompressedNative = (native) => {
        const type = native[0];
        if (type === /* VAR_PRIMITIVE */ 12 || type === /* LIST_PRIMITIVE */ 13) {
          const variableId = native[2];
          variablePool.addReference(variableId);
        } else if (type === /* BROADCAST_PRIMITIVE */ 11) {
          const broadcastId = native[2];
          variablePool.addReference(broadcastId);
        }
      };

      for (const variableId of Object.keys(target.variables)) {
        variablePool.addReference(variableId);
      }
      for (const variableId of Object.keys(target.lists)) {
        variablePool.addReference(variableId);
      }
      for (const broadcastId of Object.keys(target.broadcasts)) {
        variablePool.addReference(broadcastId);
      }
      for (const blockId of Object.keys(target.blocks)) {
        const block = target.blocks[blockId];
        blockPool.addReference(blockId);
        if (Array.isArray(block)) {
          handleCompressedNative(block);
        } else {
          // Block object
          if (block.parent) {
            blockPool.addReference(block.parent);
          }
          if (block.next) {
            blockPool.addReference(block.next);
          }
          if (block.comment) {
            commentPool.addReference(block.comment);
          }
          if (block.fields) {
            if (block.fields.VARIABLE) {
              variablePool.addReference(block.fields.VARIABLE[1]);
            }
            if (block.fields.LIST) {
              variablePool.addReference(block.fields.LIST[1]);
            }
            if (block.fields.BROADCAST_OPTION) {
              variablePool.addReference(block.fields.BROADCAST_OPTION[1]);
            }
          }
          if (block.inptus) {
            for (const inputName of Object.keys(block.inputs)) {
              const input = block.inputs[inputName];
              const inputValue = input[1];
              if (Array.isArray(inputValue)) {
                handleCompressedNative(inputValue);
              } else if (typeof inputValue === 'string') {
                const childBlockId = input[1];
                blockPool.addReference(childBlockId);
              }
            }
          }
        }
      }
      for (const commentId of Object.keys(target.comments)) {
        const comment = target.comments[commentId];
        commentPool.addReference(commentId);
        if (comment.blockId) {
          blockPool.addReference(comment.blockId);
        }
      }
    }

    variablePool.generateNewIds();

    for (const monitor of this.project.projectData.monitors) {
      const monitorId = monitor.id;
      monitor.id = variablePool.getNewId(monitorId);
    }
    for (const [target, {blockPool, commentPool}] of targetPools.entries()) {
      blockPool.generateNewIds();
      commentPool.generateNewIds();

      const newVariables = {};
      const newLists = {};
      const newBroadcasts = {};
      const newBlocks = {};
      const newComments = {};

      const handleCompressedNative = (native) => {
        const type = native[0];
        if (type === /* VAR_PRIMITIVE */ 12 || type === /* LIST_PRIMITIVE */ 13) {
          const variableId = native[2];
          native[2] = variablePool.getNewId(variableId);
        } else if (type === /* BROADCAST_PRIMITIVE */ 11) {
          const broadcastId = native[2];
          native[2] = variablePool.getNewId(broadcastId);
        }
      };

      for (const variableId of Object.keys(target.variables)) {
        const variable = target.variables[variableId];
        newVariables[variablePool.getNewId(variableId)] = variable;
      }
      for (const variableId of Object.keys(target.lists)) {
        const variable = target.lists[variableId];
        newLists[variablePool.getNewId(variableId)] = variable;
      }
      for (const broadcastId of Object.keys(target.broadcasts)) {
        const broadcast = target.broadcasts[broadcastId];
        newBroadcasts[variablePool.getNewId(broadcastId)] = broadcast;
      }
      for (const blockId of Object.keys(target.blocks)) {
        const block = target.blocks[blockId];
        newBlocks[blockPool.getNewId(blockId)] = block;
        if (Array.isArray(block)) {
          handleCompressedNative(block);
        } else {
          if (block.parent) {
            block.parent = blockPool.getNewId(block.parent);
          }
          if (block.next) {
            block.next = blockPool.getNewId(block.next);
          }
          if (block.comment) {
            block.comment = commentPool.getNewId(block.comment);
          }
          if (block.fields) {
            if (block.fields.VARIABLE) {
              block.fields.VARIABLE[1] = variablePool.getNewId(block.fields.VARIABLE[1]);
            }
            if (block.fields.LIST) {
              block.fields.LIST[1] = variablePool.getNewId(block.fields.LIST[1]);
            }
            if (block.fields.BROADCAST_OPTION) {
              block.fields.BROADCAST_OPTION[1] = variablePool.getNewId(block.fields.BROADCAST_OPTION[1]);
            }
          }
          if (block.opcode === 'procedures_call' || block.opcode === 'procedures_prototype') {
            const argumentIds = JSON.parse(block.mutation.argumentids);
            const newArgumentIds = [];
            const newInputs = {};
            for (let i = 0; i < argumentIds.length; i++) {
              const newArgumentId = generateId(i);
              if (block.inputs) {
                const originalArgumentId = argumentIds[i];
                const argumentInput = block.inputs[originalArgumentId];
                if (argumentInput) {
                  newInputs[newArgumentId] = argumentInput;
                }
              }
              newArgumentIds.push(newArgumentId);
            }
            block.inputs = newInputs;
            block.mutation.argumentids = JSON.stringify(newArgumentIds);
          }
          if (block.inputs) {
            for (const inputName of Object.keys(block.inputs)) {
              const input = block.inputs[inputName];
              const inputValue = input[1];
              if (Array.isArray(inputValue)) {
                handleCompressedNative(inputValue);
              } else if (typeof inputValue === 'string') {
                const childBlockId = input[1];
                input[1] = blockPool.getNewId(childBlockId);
              }
            }
          }
        }
      }
      for (const commentId of Object.keys(target.comments)) {
        const comment = target.comments[commentId];
        newComments[commentPool.getNewId(commentId)] = comment;
        if (comment.blockId) {
          comment.blockId = blockPool.getNewId(comment.blockId);
        }
      }

      target.variables = newVariables;
      target.lists = newLists;
      target.broadcasts = newBroadcasts;
      target.blocks = newBlocks;
      target.comments = newComments;
    }
  }
}

module.exports = OptimizeIDs;
