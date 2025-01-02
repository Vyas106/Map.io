// const Vector2D = {
//   add(a, b) {
//     return { x: a.x + b.x, y: a.y + b.y };
//   },
//   subtract(a, b) {
//     return { x: a.x - b.x, y: a.y - b.y };
//   },
//   multiply(v, scalar) {
//     return { x: v.x * scalar, y: v.y * scalar };
//   },
//   magnitude(v) {
//     return Math.sqrt(v.x * v.x + v.y * v.y);
//   },
//   normalize(v) {
//     const mag = this.magnitude(v);
//     return mag === 0 ? { x: 0, y: 0 } : this.multiply(v, 1 / mag);
//   }
// };

// module.exports = { Vector2D };


const express = require('express');
const app = express();
app.get('/',function(res,req){
  res.send('Hello World!');
});

// app.listen(3000, function(){
//   console.log('Server is running on port 3000');
// });