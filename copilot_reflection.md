### GitHub Copilot Reflection 
Throughout this project, I used GitHub Copilot to speed up development and reduce repetitive coding tasks. 
This includes: 
- Generating style sheets. 
- Producing the initial structure for the Pie Chart component required for the final enhancement. 

### Copilot Rejection
Copilot suggested an incorrect SQL update statement: 
```
UPDATE expenses SET amount = ?, category = ?, note = ?, date = ?, WHERE id = ?;
```
I rejected this code and fixed it. 
Copilot also suggested creating separate "edit" and "save" buttons, but it cluttered the UI, so I rejected it. 

## Copilot Suggestion
Copilot saved me a lot of time by generating the data structure needed for the Pie Chart: 
```
data={Object.entries(categoryTotals).map(([cat, amt], index) => ({
  name: cat,
  population: amt,
  color: chartColors[index % chartColors.length],
  legendFontColor: "#ffffff",
  legendFontSize: 12,
}))}
```
