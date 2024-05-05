const convertNumberToWords = (number) => {
        const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        const thousands = ['', 'Thousand', 'Million', 'Billion', 'Trillion', 'Quadrillion', 'Quintillion'];

        if (number === 0) { return "Zero"; };
        if (number < 0) { return "minus" + numberToWords(Math.abs(number)) };

        let words = "";

        for(let i = 0; i < thousands.length; i++){
            const x = number % 1000;
            if (x !== 0) {
                words = numberToWordsInHundreds(x) + " " + thousands[i] + " " + words;
            }
            number = Math.floor(number / 1000);
        }
        return words.trim();

    function numberToWordsInHundreds(number) {
        const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        
        let words = "";
        if(number % 100 < 10 || number % 100 >= 20) {
            words = ones[number % 10];
            number = Math.floor(number / 10);
            words = tens[number % 10] + " " + words;
            number = Math.floor(number / 10);
        } else {
            words = teens[number % 10];
            number = Math.floor(number / 100);
        }

        if(number === 0) {
            return words;
        }
        return ones[number] + " Hundred " + words;
    };
};
export { convertNumberToWords };