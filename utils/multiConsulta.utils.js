const moment = require("moment");
const { map } = require("lodash");

function SelectInnerJoinSimple(params) {
  let query = "";
  let select = params.select;
  let from = params.from;
  let innerjoin = params.innerjoin;
  let where = params.where;
  query = `SELECT `;

  map(select, (item, index) => {
    query += `${item}, `;
  });

  query = query.substring(0, query.length - 2);

  query += ` FROM public.`;

  map(from, (item, index) => {
    query += `${item}, `;
  });

  query = query.substring(0, query.length - 2);

  map(innerjoin, (item, index) => {
    query += ` INNER JOIN ${item.join}`;
    map(item.on, (item2, index2) => {
      query += ` on ${item2}`;
    });
  });

  map(where, (item, index) => {
    if (item?.like === true) {
      if (item.value instanceof Date) {
        query += ` AND ${item.key} like '${moment(item).format(
          "YYYY-MM-DD HH:mm:ss.SSS"
        )}%'`;
      } else {
        query += ` AND ${item.key} like '${item.value}%'`;
      }
    } else {
      if (typeof item.value === "string") {
        query += ` AND ${item.key} = '${item.value}'`;
      } else if (typeof item.value === "number") {
        query += ` AND ${item.key} = ${item.value}`;
      } else if (typeof item.value === "boolean") {
        query += ` AND ${item.key} = ${item.value}`;
      } else if (item.value instanceof Date) {
        query += ` AND ${item.key} = '${moment(item).format(
          "YYYY-MM-DD HH:mm:ss.SSS"
        )}'`;
      }
    }
  });

  if (!query.includes("WHERE") && query.includes("AND")) {
    let queryAux = query.split("");
    queryAux.splice(query.indexOf(" AND"), 0, " WHERE");
    queryAux.splice(query.indexOf("AND"), 4);
    queryAux.join("");
    query = queryAux.join("");
  }

  query && (query = query + ";");
  console.log(query);
  return query;
}

module.exports = {
  SelectInnerJoinSimple,
};
