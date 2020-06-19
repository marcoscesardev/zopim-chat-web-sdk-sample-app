import { SyncRedactor } from 'redact-pii-simple';

const lineRedactions = [
  {
    regex: [
      /[a-z0-9.!#$%&’*+/=?^_`{|}~-]+[\s]*@[\s]*[a-z0-9-]+(?:\.[a-z0-9-]+)*/gi
    ],
    name: 'EMAIL',
    text: '[DIHAPUS]'
  },
  {
    regex: [
      /(\d{4}(-)\d{4}(-)\d{4}(-)\d{4})/g,
      /(\d{4}(\s)\d{4}(\s)\d{4}(\s)\d{4})/g
    ],
    name: 'CREDIT_CARD',
    text: '[DIHAPUS]'
  }
];

const wordRedactions = [
  {
    regex: [
      /[+]?[(]?[0-9]{1,4}[)]?[-\s]?[0-9]{1,5}[-\s]?[0-9]{1,5}[-\s]?[0-9]{1,5}/g,
      /(\+62|62|^08)(\d{3,4}-?){2}\d{3,4}/g,
      /[+]{1}[(]?[0-9]{1,4}[)]?/g
    ],
    exclude: /^((2003)[0-9a-z]{10}|(00000158)[0-9]{10})$/gi,
    name: 'PHONE',
    text: '[DIHAPUS]'
  },
  {
    regex: [/(\d{16})/g],
    exclude: /^(00000158)[0-9]{10}$/g,
    name: 'ID_CARD',
    text: '[DIHAPUS]'
  },
  {
    regex: [
      /^(perempuan|laki-laki|lelaki|wanita|pria|(fe)?male|(wo)?m(a|e)n|c(e|o)?w(e|o)(k)?|girl|boy)$/gi
    ],
    exclude: /^((2003)[0-9a-z]{10}|(00000158)[0-9]{10})$/gi,
    name: 'GENDER',
    text: '[DIHAPUS]'
  },
  {
    regex: [
      /^((ch|k)rist(ia|e)n|(k|ch)at(h)?oli(c|k)|bud(d)?(h)?(a|ist)|m(u|o)sl(i|e)m|protestan|konghucu|hindu|islam)$/gi
    ],
    exclude: /^((2003)[0-9a-z]{10}|(00000158)[0-9]{10})$/gi,
    name: 'RELIGION',
    text: '[DIHAPUS]'
  },
  {
    regex: [
      /^(pascasarjana|pasca|sarjana|diploma|do(c|k)tor|s(mp|ma|1|2|3)|d3)$/gi
    ],
    exclude: /^((2003)[0-9a-z]{10}|(00000158)[0-9]{10})$/gi,
    name: 'EDUCATION',
    text: '[DIHAPUS]'
  }
];

export const redactCustom = (text = '') => {
  let redactedText = text;

  for (const redaction of lineRedactions) {
    const { regex, text } = redaction;
    for (const reg of regex) {
      // console.log('$$ regex is regex', reg);
      redactedText = redactedText.replace(reg, text);
    }
  }

  for (const redaction of wordRedactions) {
    const { regex, text, exclude } = redaction;
    const words = redactedText.split(/\s/);
    const redactedWords = words.map(function(word) {
      let redactedWord = word;
      for (const reg of regex) {
        // console.log('$$ exclude is ', exclude, redactedWord.match(exclude));
        redactedWord =
          exclude && redactedWord.match(exclude)
            ? redactedWord
            : redactedWord.replace(reg, text);
      }
      return redactedWord;
    });

    redactedText = redactedWords.join(' ');
  }
  // console.log(redactedText);
  return redactedText;
};

export const redactPII = (text = '') => {
  const redactor = new SyncRedactor({
    builtInRedactors: {
      creditCardNumber: {
        enabled: false
      },
      phoneNumber: {
        enabled: false
      },
      digits: {
        enabled: false
      },
      name: {
        enabled: false
      },
      password: {
        enabled: false
      },
      username: {
        enabled: false
      },
      streetAddress: {
        enabled: false
      }
    }
  });
  const redactedText = redactor.redact(redactCustom(text));
  return redactedText;
};
