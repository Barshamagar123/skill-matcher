import app from './app.js';
import config from './src/config/constants.js';

const PORT = config.PORT || 3006;

app.listen(3006, () => {
  console.log(`🚀 Backend started at port ${PORT}`);
});
