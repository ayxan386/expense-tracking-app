$("#expence-poster").submit(event => {
  event.preventDefault();
  const data = {
    title: $("input[name='title']").val(),
    amount: $("input[name='amount']").val(),
    date: $("input[name='date']").val(),
    type: $("#type").val()
  };
  $.ajax({
    method: "post",
    url: "/expence",
    data
  }).done(data => {
    if (data[0] === "S") loadExpences();
  });
});

function loadExpences() {
  $.ajax({
    method: "get",
    url: "/expence"
  }).done(data => {
    let html = [];
    data.forEach(el => {
      html.push("<li class='expence'>");
      html.push(`<header>${el.title} <small>on ${el.date}</small></header>`);
      html.push(`<div>${el.amount}$ spent for ${el.type}</div>`);
      html.push("</li>");
    });
    $("#expences").html(html.join(""));
  });
}

window.onload = () => {
  loadExpences();
  drawPie();
  drawScatter();
};
