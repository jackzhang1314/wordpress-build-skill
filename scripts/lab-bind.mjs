import { Server } from 'node:net';
// Playground CLI currently exposes a port but no bind-host option.
// Scope this preload to its one lab port; never expose the fixture on LAN interfaces.
const listen = Server.prototype.listen;
Server.prototype.listen = function (...args) {
  if (args[0] === 9462 && (args[1] === undefined || typeof args[1] === 'function')) {
    return Reflect.apply(listen, this, [9462, '127.0.0.1', ...args.slice(1)]);
  }
  return Reflect.apply(listen, this, args);
};
