const axios = require('axios');
const fs = require('fs');

async function fetchCourse() {
  try {
    const res = await axios.get('https://mrstudy.net/api/user/courses/19', {
      headers: {
        'Authorization': 'Bearer 7|zFQwKcLwv0FLVwxBzdek28X1ia0w2QEK8TExNvKb2ffcc636',
        'X-Device-Id': 'a1b2c3d4e5f6',
        'X-Device-Class': 'desktop',
        'Accept': 'application/json'
      }
    });
    fs.writeFileSync('course_19.json', JSON.stringify(res.data, null, 2));
    console.log("Success! Wrote to course_19.json");
  } catch (err) {
    fs.writeFileSync('course_19_error.json', JSON.stringify(err.response ? err.response.data : err.message, null, 2));
    console.log("Error! Wrote to course_19_error.json");
  }
}

fetchCourse();
