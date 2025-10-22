
        // Array para armazenar produtos
        let products = [];

        // Carregar produtos do localStorage ao iniciar
        document.addEventListener('DOMContentLoaded', function() {
            console.log('Aplicativo iniciado');
            loadProducts();
            updateStats();
            
            // Verificar se a biblioteca XLSX foi carregada
            if (typeof XLSX === 'undefined') {
                console.error('Biblioteca XLSX não carregada!');
                showNotification('Erro ao carregar biblioteca Excel. Recarregue a página.', 'danger');
            } else {
                console.log('Biblioteca XLSX carregada com sucesso');
            }
        });

        // Calcular preço de venda quando custo ou markup mudam
        document.getElementById('costPrice').addEventListener('input', function() {
            const markup = parseFloat(document.getElementById('markup').value);
            const salePrice = parseFloat(document.getElementById('salePrice').value);
            
            // Se tem markup, recalcular preço de venda
            if (!isNaN(markup) && markup > 0) {
                calculateSalePrice();
            }
            // Se tem preço de venda, recalcular markup
            else if (!isNaN(salePrice) && salePrice > 0) {
                calculateMarkup();
            }
        });
        
        document.getElementById('markup').addEventListener('input', function() {
            calculateSalePrice();
        });

        // Calcular markup em TEMPO REAL quando preço de venda muda
        document.getElementById('salePrice').addEventListener('input', function() {
            calculateMarkup();
        });

        function calculateSalePrice() {
            const costPrice = parseFloat(document.getElementById('costPrice').value) || 0;
            const markup = parseFloat(document.getElementById('markup').value) || 0;
            
            if (costPrice > 0) {
                const salePrice = costPrice * (1 + markup / 100);
                document.getElementById('salePrice').value = salePrice.toFixed(2);
            }
        }

        function calculateMarkup() {
            const costPrice = parseFloat(document.getElementById('costPrice').value) || 0;
            const salePrice = parseFloat(document.getElementById('salePrice').value) || 0;
            
            if (costPrice > 0) {
                const markup = ((salePrice - costPrice) / costPrice) * 100;
                document.getElementById('markup').value = markup.toFixed(2);
            }
        }

        // Formulário de adicionar produto
        document.getElementById('productForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const costPrice = parseFloat(document.getElementById('costPrice').value) || 0;
            const markup = parseFloat(document.getElementById('markup').value) || 0;
            const salePrice = parseFloat(document.getElementById('salePrice').value) || 0;
            
            // Se não tiver preço de venda, calcular
            let finalSalePrice = salePrice;
            let finalMarkup = markup;
            
            if (salePrice === 0 && markup > 0) {
                finalSalePrice = costPrice * (1 + markup / 100);
            } else if (markup === 0 && salePrice > 0) {
                finalMarkup = ((salePrice - costPrice) / costPrice) * 100;
                finalSalePrice = salePrice;
            } else if (salePrice === 0 && markup === 0) {
                showNotification('Digite o Markup % ou o Preço de Venda!', 'warning');
                return;
            }
            
            const product = {
                id: Date.now(),
                name: document.getElementById('productName').value,
                quantity: parseFloat(document.getElementById('quantity').value),
                unit: document.getElementById('unit').value,
                costPrice: costPrice,
                markup: finalMarkup,
                salePrice: finalSalePrice,
                notes: document.getElementById('notes').value,
                createdAt: new Date().toLocaleString('pt-BR')
            };

            products.push(product);
            saveProducts();
            displayProducts();
            updateStats();
            
            // Limpar formulário
            document.getElementById('productForm').reset();
            
            // Mostrar mensagem de sucesso
            showNotification('Produto adicionado com sucesso!', 'success');
        });

        function displayProducts() {
            const productsList = document.getElementById('productsList');
            
            if (products.length === 0) {
                productsList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-box-open"></i>
                        <p>Nenhum produto cadastrado ainda.</p>
                        <p>Adicione seu primeiro produto acima!</p>
                    </div>
                `;
                return;
            }

            productsList.innerHTML = products.map(product => `
                <div class="product-card">
                    <div class="product-header">
                        <div>
                            <div class="product-name">
                                <i class="fas fa-tools"></i> ${product.name}
                            </div>
                            <small style="color: #6c757d;">Adicionado em: ${product.createdAt}</small>
                        </div>
                        <div style="display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">
                            <span class="markup-badge">Markup: ${product.markup.toFixed(2)}%</span>
                            <button class="btn-delete no-print" onclick="deleteProduct(${product.id})">
                                <i class="fas fa-trash"></i> Excluir
                            </button>
                        </div>
                    </div>

                    <div class="product-details">
                        <div class="detail-item">
                            <div class="detail-label">Quantidade</div>
                            <div class="detail-value">${product.quantity.toFixed(2)} ${product.unit}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Preço de Custo</div>
                            <div class="detail-value">R$ ${product.costPrice.toFixed(2)}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Preço de Venda</div>
                            <div class="detail-value" style="color: #27ae60;">R$ ${product.salePrice.toFixed(2)}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Lucro por Unidade</div>
                            <div class="detail-value" style="color: #3498db;">R$ ${(product.salePrice - product.costPrice).toFixed(2)}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Custo Total</div>
                            <div class="detail-value">R$ ${(product.costPrice * product.quantity).toFixed(2)}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Valor Total de Venda</div>
                            <div class="detail-value" style="color: #27ae60;">R$ ${(product.salePrice * product.quantity).toFixed(2)}</div>
                        </div>
                    </div>

                    ${product.notes ? `
                        <div style="margin-top: 1rem; padding: 0.75rem; background: #fff3cd; border-radius: 5px; border-left: 3px solid #ffc107;">
                            <strong><i class="fas fa-sticky-note"></i> Observações:</strong> ${product.notes}
                        </div>
                    ` : ''}
                </div>
            `).join('');
        }

        function deleteProduct(id) {
            if (confirm('Tem certeza que deseja excluir este produto?')) {
                products = products.filter(p => p.id !== id);
                saveProducts();
                displayProducts();
                updateStats();
                showNotification('Produto excluído com sucesso!', 'danger');
            }
        }

        function updateStats() {
            const totalProducts = products.length;
            const totalCost = products.reduce((sum, p) => sum + (p.costPrice * p.quantity), 0);
            const totalRevenue = products.reduce((sum, p) => sum + (p.salePrice * p.quantity), 0);
            const avgMarkup = totalProducts > 0 ? products.reduce((sum, p) => sum + p.markup, 0) / totalProducts : 0;

            document.getElementById('totalProducts').textContent = totalProducts;
            document.getElementById('totalCost').textContent = `R$ ${totalCost.toFixed(2)}`;
            document.getElementById('totalRevenue').textContent = `R$ ${totalRevenue.toFixed(2)}`;
            document.getElementById('avgMarkup').textContent = `${avgMarkup.toFixed(2)}%`;
        }

        function saveProducts() {
            try {
                localStorage.setItem('constructionProducts', JSON.stringify(products));
                console.log('Produtos salvos:', products.length);
            } catch (error) {
                console.error('Erro ao salvar produtos:', error);
                showNotification('Erro ao salvar produtos!', 'danger');
            }
        }

        function loadProducts() {
            try {
                const saved = localStorage.getItem('constructionProducts');
                if (saved) {
                    products = JSON.parse(saved);
                    displayProducts();
                    console.log('Produtos carregados:', products.length);
                }
            } catch (error) {
                console.error('Erro ao carregar produtos:', error);
            }
        }

        function showNotification(message, type) {
            const notification = document.createElement('div');
            notification.className = `notification is-${type}`;
            notification.style.position = 'fixed';
            notification.style.top = '20px';
            notification.style.right = '20px';
            notification.style.zIndex = '9999';
            notification.style.minWidth = '300px';
            notification.style.maxWidth = '500px';
            notification.innerHTML = `
                <button class="delete" onclick="this.parentElement.remove()"></button>
                ${message}
            `;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 4000);
        }

        // EXPORTAR PARA EXCEL
        function exportToExcel() {
            console.log('Exportando para Excel...');
            
            if (typeof XLSX === 'undefined') {
                showNotification('Biblioteca Excel não carregada. Recarregue a página!', 'danger');
                return;
            }
            
            if (products.length === 0) {
                showNotification('Nenhum produto para exportar!', 'warning');
                return;
            }

            try {
                const data = products.map(p => ({
                    'Nome': p.name,
                    'Quantidade': p.quantity,
                    'Unidade': p.unit,
                    'Preço Custo (R$)': parseFloat(p.costPrice.toFixed(2)),
                    'Markup (%)': parseFloat(p.markup.toFixed(2)),
                    'Preço Venda (R$)': parseFloat(p.salePrice.toFixed(2)),
                    'Lucro Unit. (R$)': parseFloat((p.salePrice - p.costPrice).toFixed(2)),
                    'Custo Total (R$)': parseFloat((p.costPrice * p.quantity).toFixed(2)),
                    'Venda Total (R$)': parseFloat((p.salePrice * p.quantity).toFixed(2)),
                    'Observações': p.notes || '',
                    'Data Cadastro': p.createdAt
                }));

                const ws = XLSX.utils.json_to_sheet(data);
                
                // Ajustar largura das colunas
                const colWidths = [
                    { wch: 30 }, // Nome
                    { wch: 12 }, // Quantidade
                    { wch: 10 }, // Unidade
                    { wch: 15 }, // Preço Custo
                    { wch: 12 }, // Markup
                    { wch: 15 }, // Preço Venda
                    { wch: 15 }, // Lucro Unit.
                    { wch: 15 }, // Custo Total
                    { wch: 15 }, // Venda Total
                    { wch: 40 }, // Observações
                    { wch: 18 }  // Data Cadastro
                ];
                ws['!cols'] = colWidths;

                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, 'Produtos');

                const fileName = `produtos_materiais_construcao_${new Date().toISOString().split('T')[0]}.xlsx`;
                XLSX.writeFile(wb, fileName);
                
                showNotification('Arquivo Excel exportado com sucesso!', 'success');
                console.log('Excel exportado:', fileName);
            } catch (error) {
                console.error('Erro ao exportar Excel:', error);
                showNotification('Erro ao exportar Excel: ' + error.message, 'danger');
            }
        }

        // EXPORTAR PARA CSV
        function exportToCSV() {
            console.log('Exportando para CSV...');
            
            if (products.length === 0) {
                showNotification('Nenhum produto para exportar!', 'warning');
                return;
            }

            try {
                const headers = ['Nome', 'Quantidade', 'Unidade', 'Preço Custo (R$)', 'Markup (%)', 'Preço Venda (R$)', 'Lucro Unit. (R$)', 'Custo Total (R$)', 'Venda Total (R$)', 'Observações', 'Data Cadastro'];
                
                const rows = products.map(p => [
                    p.name,
                    p.quantity,
                    p.unit,
                    p.costPrice.toFixed(2),
                    p.markup.toFixed(2),
                    p.salePrice.toFixed(2),
                    (p.salePrice - p.costPrice).toFixed(2),
                    (p.costPrice * p.quantity).toFixed(2),
                    (p.salePrice * p.quantity).toFixed(2),
                    p.notes || '',
                    p.createdAt
                ]);

                let csvContent = headers.join(';') + '\n';
                rows.forEach(row => {
                    csvContent += row.map(cell => `"${cell}"`).join(';') + '\n';
                });

                const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                const url = URL.createObjectURL(blob);
                
                link.setAttribute('href', url);
                const fileName = `produtos_materiais_construcao_${new Date().toISOString().split('T')[0]}.csv`;
                link.setAttribute('download', fileName);
                link.style.visibility = 'hidden';
                
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                showNotification('Arquivo CSV exportado com sucesso!', 'success');
                console.log('CSV exportado:', fileName);
            } catch (error) {
                console.error('Erro ao exportar CSV:', error);
                showNotification('Erro ao exportar CSV: ' + error.message, 'danger');
            }
        }

        // IMPORTAR ARQUIVO (Excel ou CSV)
        function importFile(event) {
            console.log('Importando arquivo...');
            
            if (typeof XLSX === 'undefined') {
                showNotification('Biblioteca Excel não carregada. Recarregue a página!', 'danger');
                return;
            }
            
            const file = event.target.files[0];
            if (!file) return;

            console.log('Arquivo selecionado:', file.name);
            const reader = new FileReader();
            
            reader.onload = function(e) {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(firstSheet);

                    console.log('Dados lidos:', jsonData.length, 'linhas');

                    if (jsonData.length === 0) {
                        showNotification('Arquivo vazio ou formato inválido!', 'danger');
                        return;
                    }

                    let imported = 0;
                    jsonData.forEach(row => {
                        // Tentar mapear diferentes formatos de colunas
                        const name = row['Nome'] || row['name'] || row['produto'] || '';
                        const quantity = parseFloat(row['Quantidade'] || row['quantity'] || row['qtd'] || 0);
                        const unit = row['Unidade'] || row['unit'] || row['un'] || 'un';
                        const costPrice = parseFloat((row['Preço Custo (R$)'] || row['costPrice'] || row['custo'] || '0').toString().replace(',', '.'));
                        const markup = parseFloat((row['Markup (%)'] || row['markup'] || '0').toString().replace(',', '.'));
                        const salePrice = parseFloat((row['Preço Venda (R$)'] || row['salePrice'] || row['venda'] || '0').toString().replace(',', '.'));
                        const notes = row['Observações'] || row['notes'] || row['obs'] || '';

                        if (name && quantity > 0 && costPrice > 0) {
                            products.push({
                                id: Date.now() + imported,
                                name: name,
                                quantity: quantity,
                                unit: unit,
                                costPrice: costPrice,
                                markup: markup || ((salePrice - costPrice) / costPrice) * 100,
                                salePrice: salePrice || costPrice * (1 + markup / 100),
                                notes: notes,
                                createdAt: new Date().toLocaleString('pt-BR')
                            });
                            imported++;
                        }
                    });

                    if (imported > 0) {
                        saveProducts();
                        displayProducts();
                        updateStats();
                        showNotification(`${imported} produto(s) importado(s) com sucesso!`, 'success');
                        console.log('Produtos importados:', imported);
                    } else {
                        showNotification('Nenhum produto válido encontrado no arquivo!', 'warning');
                    }

                } catch (error) {
                    console.error('Erro ao importar:', error);
                    showNotification('Erro ao importar arquivo: ' + error.message, 'danger');
                }
            };

            reader.onerror = function(error) {
                console.error('Erro ao ler arquivo:', error);
                showNotification('Erro ao ler arquivo!', 'danger');
            };

            reader.readAsArrayBuffer(file);
            event.target.value = ''; // Limpar input
        }

        // IMPRIMIR EM A4
        function printProducts() {
            console.log('Imprimindo...');
            
            if (products.length === 0) {
                showNotification('Nenhum produto para imprimir!', 'warning');
                return;
            }
            
            window.print();
        }
    