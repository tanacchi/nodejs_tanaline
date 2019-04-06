const Stone = {
  Space: ' ', Black: 'O', White: 'X'
};

class Board {
  constructor(size) {
    this.size = size;
    this.data = new Array();
    for (let i = 0; i < size*size; ++i) {
      this.data.push(Stone.Space);
    }
  }

  show() {
    console.log("================");
    for (let col = 0; col < this.size; ++col) {
      for (let row = 0; row < this.size; ++row) {
        process.stdout.write(`${this.data[col*this.size + row]} `);
      }
      process.stdout.write('\n');
    }
    console.log("================");
  }

  inRange(x, y) {
    return (0 <= x && x < this.size) && (0 <= y && y < this.size);
  }

  getAccessNum(x, y) {
    return this.size * y + x;
  }

  getStone(x, y) {
    return this.data[this.getAccessNum(x, y)];
  }

  setStone(x, y, stone) {
    if (!this.inRange(x, y) || this.getStone(x, y) != Stone.Space)
      return false;
    const index = this.getAccessNum(x, y);
    this.data[index] = stone;
    return true;
  }

  getLengthOfLine(x, y, dir) {
    const activeStone = this.getStone(x, y);
    if (activeStone == Stone.Space) return 0;
    let length = 1;
    for (; this.inRange(x+dir.x*length, y+dir.y*length); ++length) {
      const targetStone = this.getStone(x+dir.x*length, y+dir.y*length);
      if (targetStone != activeStone) break;
    }
    return length;
  }

  isGameover() {
    if (this.data.indexOf(Stone.Space) == -1) {
      console.log("We can't put stone any more.");
      return true;
    }

    const dirs = [
      {x: 1, y: 0}, 
      {x: 1, y: 1}, 
      {x: 0, y: 1}, 
      {x:-1, y: 1}
    ]
    for (let y = 0; y < this.size; ++y) { 
      for (let x = 0; x  <this.size; ++x) 
        for (const dir of dirs) 
          if (this.getLengthOfLine(x, y, dir) >= 5) return true;
    }
    return false;
  }
}


if (require.main === module) {
  const board = new Board(8);  
  board.show();
  
  let turn = 1;
  while (!board.isGameover()) {
    console.log(`turn: ${turn}`);

    const x = Math.floor(Math.random() * 8);
    const y = Math.floor(Math.random() * 8);
    const stone = (turn % 2) == 0 ? Stone.White : Stone.Black;
    console.log(`x: ${x}, y: ${y}, stone: '${stone}'`);

    if (board.setStone(x, y, stone)) {
      board.show();
      ++turn;
    }
  }
}
