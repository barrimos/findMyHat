class Queue{
  constructor(maxLen = null){
    this.element = [];
    this.maxLen = maxLen;
  }
  maxlength = (fncName) => {
    let pushleft = ['extendleft', 'appendleft'];
    let push = ['extend', 'append'];
    if(this.maxLen !== null){
      if(this.element.length > this.maxLen){
        let diff = this.element.length - this.maxLen;
        for(let i = 0; i < diff; i++){
          if(pushleft.includes(fncName)){
            this.element.pop();
          }
          if(push.includes(fncName)){
            this.element.shift();
          }
        }
      }
    }
  }
  get = () => {
    if(this.empty()){
      throw Error('Element is empty.');
    }
    return this.element.shift();
  }
  empty = () => {
    return this.element.length === 0;
  }
  extend = iterable => { // iterable
    if(!Array.isArray(iterable)){
      throw new TypeError('Argument can not iterable.');
    }
    this.element.concat(iterable);
    this.maxlength(this.extend.name);
  }
  extendleft = iterable => { // iterable
    if(!Array.isArray(iterable)){
      throw new TypeError('Argument can not iterable.');
    }
    for(let i of iterable){
      this.appendleft(i);
    }
    this.maxlength(this.extendleft.name);
  }
  pop = () => {
    this.element.pop();
  }
  popleft = () => {
    this.element.shift();
  }
  index = (x, start) => {
    return this.element.indexOf(x, start)
  }
  append = x => {
    if(Array.isArray(x)){
      for(let i of x){
        this.element.push(i);
      }
    } else {
      this.element.push(x);
    }
    this.maxlength(this.append.name);
  }
  appendleft = x => {
    this.element.unshift(x);
    this.maxlength(this.appendleft.name);
  }
  reverse = () => {
    this.element.reverse();
  }
  rotate = s => {
    for(let i = 0; i < Math.abs(s); i++){
      if(s > 0){
        let last = this.element.pop();
        this.appendleft(last);
      }
      if(s < 0){
        let first = this.element.shift();
        this.append(first);
      }
    }
  }
  insert = (index, x) => {
    this.element.splice(index, 0, x);
  }
  remove = x => { // remove() method removes the first occurrence of the value
    let idx = this.element.indexOf(x);
    this.element.splice(idx, 1);
  }
  count = x => {
    let occurence = 0;
    for(let num of this.element){
      occurence = num === x ? occurence + 1 : occurence + 0;
    }
    return occurence;
  }
  copy = (maxLen) => {
    let new_copy = new Queue(maxLen);
    new_copy.append(this.element);
    return new_copy;
  }
}

module.exports = { Queue };