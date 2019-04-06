const Stone = {
  Space: ' ', Black: 'O', White: 'X'
};

class Board {
  constructor(size) {
    this.size = size;
    this.data = [];
    for (let i = 0; i < size*size; ++i) {
      this.data.push(Stone.Space);
    }
  }

  show() {
    for (let col = 0; col < this.size; ++col) {
      for (let row = 0; row < this.size; ++row) {
        process.stdout.write(`${this.data[col*this.size + row]} `);
      }
      process.stdout.write('\n');
    }
  }
}


if (require.main === module) {
  const board = new Board(8);  
  board.show();
}
