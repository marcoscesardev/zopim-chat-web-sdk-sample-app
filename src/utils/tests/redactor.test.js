import * as helpers from '../redactor';

describe('redactCustom', () => {
  const tests = [
    {
      scenario: 'No Data to Redact ',
      input: 'Hello World',
      output: 'Hello World'
    },
    {
      scenario: 'Redact Phone Number ',
      input: '+6212345678',
      output: '[DIHAPUS]'
    },
    {
      scenario: 'Redact Phone Number ',
      input: '+62 12345678',
      output: '[DIHAPUS] [DIHAPUS]'
    },
    {
      scenario: 'Redact Phone Number ',
      input: '+62-12345678',
      output: '[DIHAPUS]'
    },
    {
      scenario: 'Redact Phone Number ',
      input: '62123456787878',
      output: '[DIHAPUS]'
    },
    {
      scenario: 'Redact Phone Number ',
      input: '62-12345678',
      output: '[DIHAPUS]'
    },
    {
      scenario: 'Redact Phone Number ',
      input: '+65 12345678',
      output: '[DIHAPUS] [DIHAPUS]'
    },
    {
      scenario: 'Redact Phone Number ',
      input: '+6512345678',
      output: '[DIHAPUS]'
    },
    {
      scenario: 'Redact Phone Number ',
      input: '12345678',
      output: '[DIHAPUS]'
    },
    {
      scenario: 'Redact Phone Number ',
      input: '6512345678',
      output: '[DIHAPUS]'
    },
    {
      scenario: 'Redact Phone Number ',
      input: '086533545445',
      output: '[DIHAPUS]'
    },
    {
      scenario: 'Redact ID ',
      input: '1111222233334444',
      output: '[DIHAPUS]'
    },
    {
      scenario: 'Redact Card Number with dash',
      input: '4111-4111-4111-4111',
      output: '[DIHAPUS]'
    },
    {
      scenario: 'Redact Card Number with space ',
      input: '4111 4111 4111 4111',
      output: '[DIHAPUS]'
    },
    {
      scenario: 'Redact Phone Number ',
      input: 'Hello +6212345678World',
      output: 'Hello [DIHAPUS]World'
    },
    {
      scenario: 'Redact Phone Number ',
      input: 'Hello +62 12345678World',
      output: 'Hello [DIHAPUS] [DIHAPUS]World'
    },
    {
      scenario: 'Redact Phone Number ',
      input: 'Hello +62-12345678World',
      output: 'Hello [DIHAPUS]World'
    },
    {
      scenario: 'Redact Phone Number ',
      input: 'Hello 62123456787878World',
      output: 'Hello [DIHAPUS]World'
    },
    {
      scenario: 'Redact Phone Number ',
      input: 'Hello 62-12345678World',
      output: 'Hello [DIHAPUS]World'
    },
    {
      scenario: 'Redact Phone Number ',
      input: 'Hello +65 12345678World',
      output: 'Hello [DIHAPUS] [DIHAPUS]World'
    },
    {
      scenario: 'Redact Phone Number ',
      input: 'Hello +6512345678World',
      output: 'Hello [DIHAPUS]World'
    },
    {
      scenario: 'Redact Phone Number ',
      input: 'Hello 12345678World',
      output: 'Hello [DIHAPUS]World'
    },
    {
      scenario: 'Redact Phone Number ',
      input: 'Hello 6512345678World',
      output: 'Hello [DIHAPUS]World'
    },
    {
      scenario: 'Redact Phone Number ',
      input: 'Hello 086533545445World',
      output: 'Hello [DIHAPUS]World'
    },
    {
      scenario: 'Redact ID ',
      input: 'Hello 1111222233334444World',
      output: 'Hello [DIHAPUS]World'
    },
    {
      scenario: 'Redact Card Number with dash',
      input: 'Hello 4111-4111-4111-4111World',
      output: 'Hello [DIHAPUS]World'
    },
    {
      scenario: 'Redact Card Number with space ',
      input: 'Hello 4111 4111 4111 4111World',
      output: 'Hello [DIHAPUS]World'
    },
    {
      scenario: 'Redact Email ',
      input: 'Hello@World.com',
      output: '[DIHAPUS]'
    },
    {
      scenario: 'Redact Email with space before @',
      input: 'Hello @World.com',
      output: '[DIHAPUS]'
    },
    {
      scenario: 'Redact Email with space after @ ',
      input: 'Hello@ World.com',
      output: '[DIHAPUS]'
    },
    {
      scenario: 'Redact Gender',
      input: 'Perempuan Wanita Cewek Cewe Lelaki Laki-laki Pria Cowo Cowok Male Female Boy Girl male female boy girl Woman Women Man Men Cwe Cwo',
      output: '[DIHAPUS] [DIHAPUS] [DIHAPUS] [DIHAPUS] [DIHAPUS] [DIHAPUS] [DIHAPUS] [DIHAPUS] [DIHAPUS] [DIHAPUS] [DIHAPUS] [DIHAPUS] [DIHAPUS] [DIHAPUS] [DIHAPUS] [DIHAPUS] [DIHAPUS] [DIHAPUS] [DIHAPUS] [DIHAPUS] [DIHAPUS] [DIHAPUS] [DIHAPUS]'
    },
    {
      scenario: 'Redact Religion',
      input: 'katolik katholik kristen islam muslim moslem Hindu Budha Konghucu Christian protestan buddha Islam Kristen buddist chatolic',
      output: '[DIHAPUS] [DIHAPUS] [DIHAPUS] [DIHAPUS] [DIHAPUS] [DIHAPUS] [DIHAPUS] [DIHAPUS] [DIHAPUS] [DIHAPUS] [DIHAPUS] [DIHAPUS] [DIHAPUS] [DIHAPUS] [DIHAPUS] [DIHAPUS]'
    },
    {
      scenario: 'Redact Education',
      input: 'SMA SMP D3 S1 S2 DIPLOMA SARJANA PASCASARJANA PASCA SARJANA S3 Doktor',
      output: '[DIHAPUS] [DIHAPUS] [DIHAPUS] [DIHAPUS] [DIHAPUS] [DIHAPUS] [DIHAPUS] [DIHAPUS] [DIHAPUS] [DIHAPUS] [DIHAPUS] [DIHAPUS]'
    }
  ];

  for (let test of tests) {
    const { scenario, input, output } = test;
    it(`${scenario}:\n\t${input}\n\t=>\n\t${output}`, () => {
      const result = helpers.redactCustom(input);
      expect(result).toEqual(output);
    });
  }
});
