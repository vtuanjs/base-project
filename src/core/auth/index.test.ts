import { describe, it } from 'mocha';
import { expect } from 'chai';
import { verifyJWT, generateJWt } from './index';

const secretKey = 'mykey';

const payload = {
  id: '123',
  name: 'Tuan'
};

let token = null;
describe('GENERATE TOKEN', () => {
  it('should be return new token', (done) => {
    token = generateJWt(payload, { secretKey });
    expect(token).to.be.a('string');
    done();
  });
});

describe('VERIFY TOKEN', () => {
  it('should be an exprected object', (done) => {
    const result = verifyJWT({ token, secretKey });
    expect(JSON.stringify(result)).to.equals(JSON.stringify(result));
    done();
  });
});
