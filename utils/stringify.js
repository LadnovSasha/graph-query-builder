module.exports = {
  stringifyEnum(value) {
    if (Array.isArray(value)) {
      const result = value.map((val) => val.toUpperCase()).join(',');
      return `[${result}]`
    } else {
      return value;
    }
  },

  stringifyObject(obj) {
    const result = [];

    Object.keys(obj).forEach(key => {
      result.push(`${key}:${this.stringifyValue(obj[key])}`)
    });

    return `${result.join(',')}`;
  },

  stringifyValue(value) {
    let result = '';

    if (Array.isArray(value)) {
      result = value.map((arrValue) => this.stringifyValue(arrValue)).join(',')
    }
    else if (typeof value === 'object') {
      if (value.type.toLowerCase() === 'enum')
        result = this.stringifyEnum(value.value)
      else
        result = this.stringifyObject(value);
    } else {
      result = JSON.stringify(value)
    }

    return result;
  }
};
