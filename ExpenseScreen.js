import React, { useEffect, useState, useMemo } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';

export default function ExpenseScreen() {
  const db = useSQLiteContext();

  const [expenses, setExpenses] = useState([]);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [filter, setFilter] = useState('ALL'); // Filter State: ALL | WEEK | MONTH 
  const [editingId, setEditingId] = useState(null); // Track expense being edited

  // Helper Functions 
   const filteredExpenses = useMemo(() => {
    const now = new Date();

    return expenses.filter((e) => {
      if (filter === 'ALL') return true;

      if (!e.date) return false;
      const d = new Date(e.date);
      if (Number.isNaN(d.getTime())) return false;

      if (filter === 'WEEK') {
        const diffDays = (now - d) / (1000 * 60 * 60 * 24);
        return diffDays >= 0 && diffDays < 7; // last 7 days
      }

      if (filter === 'MONTH') {
        return (
          d.getFullYear() === now.getFullYear() &&
          d.getMonth() === now.getMonth()
        );
      }

      return true;
    });
  }, [expenses, filter]);

  // Overall total 
  const totalSpending = useMemo (() => {
    return filteredExpenses.reduce((sum, e) => {
      const amt = Number(e.amount) || 0; 
      return sum + amt; 
    }, 0);
  }, [filteredExpenses]);

  // Totals by category 
  const categoryTotals = useMemo(() => {
    const map = {};
    filteredExpenses.forEach((e) => {
      const key = e.category || "Uncategorized";
      const amt = Number(e.amount) || 0;
      map[key] = (map[key] || 0) + amt; 
    });
    return map;
  }, [filteredExpenses]);

  const loadExpenses = async () => {
    const rows = await db.getAllAsync(
      'SELECT * FROM expenses ORDER BY id DESC;'
    );
    setExpenses(rows);
  };

    const addExpense = async () => {
    const amountNumber = parseFloat(amount);

    if (isNaN(amountNumber) || amountNumber <= 0) {
      // Basic validation: ignore invalid or non-positive amounts
      return;
    }

    const trimmedCategory = category.trim();
    const trimmedNote = note.trim();

    if (!trimmedCategory) {
      // Category is required
      return;
    }

    await db.runAsync(
      'INSERT INTO expenses (amount, category, note, date) VALUES (?, ?, ?, ?);',
      [amountNumber, trimmedCategory, trimmedNote || null, date]
    );

    setAmount('');
    setCategory('');
    setNote('');
    setDate(new Date().toISOString().slice(0,10)); 

    loadExpenses();
  };

  // Start Editing
  const startEdit = (expense) => {
    setEditingId(expense.id);
    setAmount(String(expense.amount));
    setCategory(expense.category || "");
    setNote(expense.note || "");
    setDate(expense.date || new Date().toISOString().slice(0,10));
  };

  // Cancel Editing
  const cancelEdit = () => {
    setEditingId(null);
    setAmount('');
    setCategory('');
    setNote('');
    setDate(new Date().toISOString().slice(0,10)); 
  };

  // Update Expense
  const saveEdit = async () => {
    if (editingId == null) return; 

    const amountNumber = parseFloat(amount); 
    if (isNaN(amountNumber) || amountNumber <= 0) {
      return;
    }

    const trimmedCategory = category.trim();
    const trimmedNote = note.trim(); 
    if (!trimmedCategory) {
      return; 
    }

    await db.runAsync(
      'UPDATE expenses SET amount = ?, category = ?, note = ?, date = ? WHERE id = ?;',
      [amountNumber, trimmedCategory, trimmedNote || null, date, editingId]
    );

    cancelEdit();
    loadExpenses();
  };

    const deleteExpense = async (id) => {
    await db.runAsync('DELETE FROM expenses WHERE id = ?;', [id]);
    loadExpenses();
  };
     const renderExpense = ({ item }) => (
    <TouchableOpacity
      style={styles.expenseRow}
      onPress={() => startEdit(item)}
      activeOpacity={0.8}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.expenseAmount}>${Number(item.amount).toFixed(2)}</Text>
        <Text style={styles.expenseCategory}>{item.category}</Text>
        <Text style={styles.expenseDate}>{item.date}</Text>
        {item.note ? <Text style={styles.expenseNote}>{item.note}</Text> : null}
      </View>

      <TouchableOpacity onPress={() => deleteExpense(item.id)}>
        <Text style={styles.delete}>✕</Text>
      </TouchableOpacity>
    </TouchableOpacity>
);
  useEffect(() => {
    async function setup() {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS expenses (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         amount REAL NOT NULL,
         category TEXT NOT NULL,
         note TEXT,
         date TEXT NOT NULL
      );
    `);

      await loadExpenses();
    }

    setup();
  }, []);
    return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Student Expense Tracker</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Amount (e.g. 12.50)"
          placeholderTextColor="#9ca3af"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
        <TextInput
          style={styles.input}
          placeholder="Category (Food, Books, Rent...)"
          placeholderTextColor="#9ca3af"
          value={category}
          onChangeText={setCategory}
        />
        <TextInput
          style={styles.input}
          placeholder="Note (optional)"
          placeholderTextColor="#9ca3af"
          value={note}
          onChangeText={setNote}
        />
        <TextInput
          style={styles.input}
          placeholder='Date (YYYY-MM-DD)'
          placeholderTextColor= "#9ca3af"
          value={date}
          onChangeText={setDate}
          />
          <Button
          title={editingId ? "Save Changes" : "Add Expense"}
          onPress={editingId ? saveEdit : addExpense}
        />
      </View>
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'ALL' && styles.filterButtonActive,
          ]}
          onPress={() => setFilter('ALL')}
        >
          <Text style={styles.filterButtonText}>All</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'WEEK' && styles.filterButtonActive,
          ]}
          onPress={() => setFilter('WEEK')}
        >
          <Text style={styles.filterButtonText}>This Week</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'MONTH' && styles.filterButtonActive,
          ]}
          onPress={() => setFilter('MONTH')}
        >
          <Text style={styles.filterButtonText}>This Month</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.totalsBox}>
        <Text style={styles.totalsHeading}>
          Total Spending{' '}
          {filter === 'ALL'
            ? '(All)'
            : filter === 'WEEK'
            ? '(This Week)'
            : '(This Month)'}
          : ${totalSpending.toFixed(2)}
        </Text>

        {Object.keys(categoryTotals).length > 0 && (
          <View style={styles.totalsList}>
            {Object.entries(categoryTotals).map(([cat, amt]) => (
              <Text key={cat} style={styles.totalsItem}>
                {cat}: ${amt.toFixed(2)}
              </Text>
            ))}
          </View>
        )}
      </View>

      <FlatList
        data={filteredExpenses}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderExpense}
        ListEmptyComponent={
          <Text style={styles.empty}>No expenses yet.</Text>
        }
      />

      <Text style={styles.footer}>
        Enter your expenses and they’ll be saved locally with SQLite.
      </Text>
    </SafeAreaView>
  )}; 
  
  const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#111827' },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  form: {
    marginBottom: 16,
    gap: 8,
  },
  input: {
    padding: 10,
    backgroundColor: '#1f2937',
    color: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fbbf24',
  },
  expenseCategory: {
    fontSize: 14,
    color: '#e5e7eb',
  },
  expenseNote: {
    fontSize: 12,
    color: '#9ca3af',
  },
  delete: {
    color: '#f87171',
    fontSize: 20,
    marginLeft: 12,
  },
  empty: {
    color: '#9ca3af',
    marginTop: 24,
    textAlign: 'center',
  },
  footer: {
    textAlign: 'center',
    color: '#6b7280',
    marginTop: 12,
    fontSize: 12,
  },
  expenseDate: {
  fontSize: 12,
  color: '#e5e7eb',
  },  
  filterRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: 12,
  marginTop: 8,
},
  filterButton: {
  flex: 1,
  marginHorizontal: 4,
  paddingVertical: 8,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: '#4b5563',
  alignItems: 'center',
  backgroundColor: '#111827',
},
  filterButtonActive: {
  backgroundColor: '#4f46e5',
  borderColor: '#6366f1',
},
  filterButtonText: {
  color: '#e5e7eb',
  fontWeight: '600',
  fontSize: 12,
},
totalsBox: {
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#4b5563',
},
  totalsHeading: {
    color: '#e5e7eb',
    fontWeight: '700',
    marginBottom: 4,
},
totalsList: {
    marginTop: 4,
},
totalsItem: {
    color: '#cbd5f5',
    fontSize: 12,
},

},);