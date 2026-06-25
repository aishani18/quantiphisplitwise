const API_URL = "http://127.0.0.1:5000";

const sliders = document.querySelectorAll(".slider");

const memberChecks = document.querySelectorAll(".member-check");

const totalPercentage = document.getElementById("totalPercentage");

const submitBtn = document.getElementById("submitBtn");

const balancesContainer = document.getElementById("balancesContainer");

const historyContainer = document.getElementById("historyContainer");

const amountInput = document.getElementById("amount");

const payerInput = document.getElementById("payer");

const descriptionInput = document.getElementById("description");

const equalSplitBtn = document.getElementById("equalSplitBtn");

const personFilter = document.getElementById("personFilter");

const members = {
  Amit: 0,
  Rahul: 0,
  Sneha: 0,
};

sliders.forEach((slider) => {
  slider.addEventListener("input", (e) => {
    const name = e.target.dataset.name;

    members[name] = Number(e.target.value);

    updateUI();
  });
});

memberChecks.forEach((check) => {
  check.addEventListener("change", (e) => {
    const name = e.target.dataset.name;

    const slider = document.querySelector(`.slider[data-name="${name}"]`);

    if (e.target.checked) {
      slider.disabled = false;
    } else {
      slider.disabled = true;

      slider.value = 0;

      members[name] = 0;
    }

    updateUI();
  });
});

equalSplitBtn.addEventListener("click", () => {
  const activeMembers = [];

  memberChecks.forEach((check) => {
    if (check.checked) {
      activeMembers.push(check.dataset.name);
    }
  });

  if (activeMembers.length === 0) {
    return;
  }

  const equalShare = 100 / activeMembers.length;

  Object.keys(members).forEach((name) => {
    if (activeMembers.includes(name)) {
      members[name] = Number(equalShare.toFixed(2));
    } else {
      members[name] = 0;
    }
  });

  const totalAssigned = equalShare * activeMembers.length;

  const difference = 100 - totalAssigned;

  if (difference !== 0) {
    const lastMember = activeMembers[activeMembers.length - 1];

    members[lastMember] += difference;
  }

  sliders.forEach((slider) => {
    const name = slider.dataset.name;

    slider.value = members[name];
  });

  updateUI();
});

personFilter.addEventListener("change", () => {
  loadHistory();
});

function updateUI() {
  document.getElementById("amitPercent").innerText =
    Number(members.Amit).toFixed(2) + "%";

  document.getElementById("rahulPercent").innerText =
    Number(members.Rahul).toFixed(2) + "%";

  document.getElementById("snehaPercent").innerText =
    Number(members.Sneha).toFixed(2) + "%";

  const total =
    Number(members.Amit) + Number(members.Rahul) + Number(members.Sneha);

  totalPercentage.innerText = total.toFixed(2) + "%";

  const hasParticipant =
    members.Amit > 0 || members.Rahul > 0 || members.Sneha > 0;

  submitBtn.disabled = total.toFixed(2) !== "100.00" || !hasParticipant;
}

submitBtn.addEventListener("click", async () => {
  const amount = Number(amountInput.value);

  const payer = payerInput.value;

  const description = descriptionInput.value.trim();

  if (!amount || !description) {
    return;
  }

  const splits = [];

  Object.keys(members).forEach((person) => {
    const percentage = members[person];

    if (percentage === 0 || person === payer) {
      return;
    }

    const share = (percentage / 100) * amount;

    splits.push({
      debtor: person,
      amount: share.toFixed(2),
    });
  });

  await fetch(`${API_URL}/expenses`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      description,
      payer,
      splits,
    }),
  });

  clearForm();

  loadBalances();

  loadHistory();
});

async function loadBalances() {
  const response = await fetch(`${API_URL}/balances`);

  const balances = await response.json();

  balancesContainer.innerHTML = "";

  if (balances.length === 0) {
    balancesContainer.innerHTML = `
      <div class="balance-item">
        Everyone is settled up
      </div>
    `;

    return;
  }

  balances.forEach((item) => {
    const div = document.createElement("div");

    div.classList.add("balance-item");

    div.innerHTML = `
      ${item.debtor} owes
      ${item.creditor}
      ₹${item.amount}
    `;

    balancesContainer.appendChild(div);
  });
}

async function loadHistory() {
  const response = await fetch(`${API_URL}/expenses`);

  const expenses = await response.json();

  historyContainer.innerHTML = "";

  if (expenses.length === 0) {
    historyContainer.innerHTML = `
      <div class="empty-state">
        No expenses yet
      </div>
    `;

    return;
  }

  const selectedPerson = personFilter.value;

  let filteredExpenses = expenses;

  if (selectedPerson !== "All") {
    filteredExpenses = expenses.filter(
      (item) => item.debtor === selectedPerson || item.payer === selectedPerson,
    );
  }

  filteredExpenses.sort((a, b) => {
    if (a.settled !== b.settled) {
      return a.settled - b.settled;
    }

    return b.id - a.id;
  });

  filteredExpenses.forEach((item) => {
    const div = document.createElement("div");

    div.classList.add("history-item");

    if (item.settled === 1) {
      div.classList.add("settled");
    }

    div.innerHTML = `
      <strong>${item.description}</strong>

      <div>
        ${item.debtor} owes
        ${item.payer}
        ₹${item.amount}
      </div>

      <div class="action-buttons">

        <button
          class="settle-btn"
          onclick="settleDebt(${item.id})"
          ${item.settled === 1 ? "disabled" : ""}
        >
          ${item.settled === 1 ? "Settled" : "Mark as Settled"}
        </button>

        ${
          item.settled === 1
            ? `
            <button
              class="delete-btn"
              onclick="deleteDebt(${item.id})"
            >
              Delete Record
            </button>
          `
            : ""
        }

      </div>
    `;

    historyContainer.appendChild(div);
  });
}

async function settleDebt(id) {
  await fetch(`${API_URL}/settle/${id}`, {
    method: "PATCH",
  });

  loadBalances();

  loadHistory();
}

async function deleteDebt(id) {
  await fetch(`${API_URL}/expenses/${id}`, {
    method: "DELETE",
  });

  loadBalances();

  loadHistory();
}

function clearForm() {
  amountInput.value = "";

  descriptionInput.value = "";

  members.Amit = 0;
  members.Rahul = 0;
  members.Sneha = 0;

  sliders.forEach((slider) => {
    slider.value = 0;

    slider.disabled = true;
  });

  memberChecks.forEach((check) => {
    check.checked = false;
  });

  updateUI();
}

loadBalances();

loadHistory();

updateUI();
