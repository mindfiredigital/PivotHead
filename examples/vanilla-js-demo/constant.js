const temp = {
    textAlign: "Left",
    thousandSeparator: ",",
    decimalSeparator: ".",
    decimalPlaces: 2,
    currencySymbol: "$",
    currencyAlign: "Left",
    nullValue: "None",
    formatAsPercent: "No"
}

export const tempFun =(data)  => {
 temp.align = data
};

export default temp 