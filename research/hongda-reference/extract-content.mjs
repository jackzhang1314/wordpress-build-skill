import fs from 'node:fs';
import { parse } from 'espree';
const ast = parse(fs.readFileSync(new URL('./deployment/assets/index-XbKuH3yj.js', import.meta.url), 'utf8'), { ecmaVersion: 'latest', sourceType: 'module', range: true });
const values = new Map();
function literal(node) {
  if (!node) throw new Error('Missing expression');
  switch (node.type) {
    case 'Literal': return node.value;
    case 'Identifier': if (values.has(node.name)) return values.get(node.name); throw new Error(`Unknown ${node.name}`);
    case 'ArrayExpression': return node.elements.map(literal);
    case 'ObjectExpression': return Object.fromEntries(node.properties.map(p => {
      if(p.type !== 'Property' || p.method || p.computed) throw new Error('Unsupported property');
      return [p.key.name ?? p.key.value, literal(p.value)];
    }));
    case 'MemberExpression': {const o = literal(node.object); const key = node.computed ? literal(node.property) : node.property.name; if(!Object.hasOwn(o,key)) throw new Error('Missing property'); return o[key];}
    case 'UnaryExpression': if(node.operator === '!') return !literal(node.argument); if(node.operator === '-') return -literal(node.argument); throw new Error('Unsupported unary');
    case 'CallExpression': if (node.callee.type === 'Identifier' && node.callee.name === 'Xe' && node.arguments.length === 1) return `https://upload.wikimedia.org/wikipedia/commons/${literal(node.arguments[0])}`; throw new Error('Function execution prohibited');
    default: throw new Error(`Unsupported ${node.type}`);
  }
}
for (const statement of ast.body) if (statement.type === 'VariableDeclaration') for(const d of statement.declarations) {
  if(d.id.type !== 'Identifier' || d.start < 175000) continue;
  try { values.set(d.id.name, literal(d.init)); } catch { /* Compiled executable code intentionally excluded. */ }
}
const names = {company:'T',navigation:'kd',footerEquipment:'gm',footerIndustries:'ym',localAssets:'Z',referencePhotos:'A',heroCards:'Nm',categories:'ko',benefits:'en',products:'jo',industries:'Mr',manufacturingBenefits:'Rm',manufacturingClaims:'Wm',galleries:'Qs',posts:'So',stories:'bd',contactTopics:'Nd'};
const output = {};
for (const [name,id] of Object.entries(names)) {
  if(!values.has(id)) throw new Error(`Could not extract ${name} (${id})`);
  output[name] = values.get(id);
}
fs.writeFileSync(new URL('./content.json', import.meta.url), JSON.stringify(output,null,2)+'\n');
console.log(Object.fromEntries(Object.entries(output).map(([k,v])=>[k,Array.isArray(v)?v.length:Object.keys(v).length])));
