import glob, os.path, time, sys


def pack():
  output = open('./src/lib/shaders.js', 'wt')
  files = glob.glob('./src/shaders/*.glsl')

  output.write('export var shaders = {\n')

  for file in files:
    f = open(file, 'rt')
    shader = f.read()
    f.close()
    var = '_'.join(os.path.basename(file).split('.')[:-1])
    output.write(var + ' : `\n')
    output.write(shader.strip())
    output.write('\n`,\n\n')

  output.write('};')
  output.close()
  print('packed')

print('PACK SHADERS')
while True:
  pack()
  time.sleep(int(sys.argv[1] if len(sys.argv) > 1 else 5))

