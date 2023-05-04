$(async function()
{
    let categories = await loadCategories();
    let products = await loadProducts(); 

    let currentSort = (a, b) => 
    {
        if (a.unitsInStock == 0 && b.unitsInStock == 0)
            return a.productName.localeCompare(b.productName); 
        if (a.unitsInStock == 0)
            return -1; 
        if (b.unitsInStock == 0)
            return 1;
        if (a.unitsInStock < a.reorderLevel && b.unitsInStock < b.reorderLevel)
            return a.productName.localeCompare(b.productName); 
        if (a.unitsInStock < a.reorderLevel)
            return -1;
        if (b.unitsInStock < b.reorderLevel)
            return 1; 
        return a.productName.localeCompare(b.productName); 
    };

    renderCategories(); 

    const pageSize = 10; 
    let currentPage = 0; 
    let maxPage = 0; 
    let searchedProducts = []; 

    renderProducts();

    async function loadCategories()
    {
        return await $.getJSON({
            url: `../../api/category/`,
            error: function(jqXHR, textStatus, errorThrown)
            {
                console.log("The following error occured: " + textStatus, errorThrown); 
            }
        });
    }

    async function loadProducts()
    {
        return await $.getJSON({
            url: `../../api/product/discontinued/false/`,
            error: function (jqXHR, textStatus, errorThrown) 
            {
                // log the error to the console
                console.log("The following error occured: " + textStatus, errorThrown);
            }
        });
    }

    function getCategoryName(id)
    {
        return categories.find(c => c.categoryId == id).categoryName; 
    }

    function renderCategories()
    {
        $('#product_categories').html(''); 
        $('#product_categories').append(`<option data-id='-1'>All</option>`);
        for (let i = 0; i < categories.length; i++)
        {
            let html = `<option data-id='${categories[i].categoryId}'>${categories[i].categoryName}</option>`; 
            $('#product_categories').append(html);
        }
    }

    function renderProducts()
    {
        $('#product_rows').html('');
        let searchTerm = $('#product_search').val(); 

        let selectedCategory = $('#product_categories').find(':selected').data('id');

        searchedProducts = [];
        for (let i = 0; i < products.length; i++)
        {
            if (searchTerm === undefined || products[i].productName.includes(searchTerm))
                if (selectedCategory < 0 || selectedCategory == products[i].categoryId)
                    searchedProducts.push(products[i]);
        }

        searchedProducts.sort(currentSort);
        let currentIndex = currentPage * pageSize; 
        for (var i = currentIndex; i < currentIndex + pageSize; i++)
        {
            if (i >= searchedProducts.length)
            {
                let row = $(`<tr class='empty-product-row'>
                    <td class='empty-product-row'>&nbsp;</td>
                    <td class='empty-product-row'>&nbsp;</td>
                    <td class='empty-product-row'>&nbsp;</td>
                    <td class='empty-product-row'>&nbsp;</td>
                </tr>`);
                row.appendTo('#product_rows');
                continue;
            } 

            let product = searchedProducts[i]; 
            let stockLevel = "high-stock";
            if (product.unitsInStock < product.reorderLevel || product.reorderLevel <= 0)
            {
                if (product.unitsInStock == 0)
                    stockLevel = "low-stock";
                else
                    stockLevel = "medium-stock";
            }
            
            let row = $(`<tr>
                <td class='${stockLevel} product_row'>${product.productName}</td>
                <td class='text-right product_row ${stockLevel}'>${getCategoryName(product.categoryId)}</td>
                <td class='product_row ${stockLevel}'>
                    <input class='stock_input' type='number' value='${product.unitsInStock}' data-product-id='${product.productId}'>
                </td>
                <td class='text-right product_row ${stockLevel}'>
                    <input class='reorder_input' type='number' value='${product.reorderLevel}' data-product-id='${product.productId}'>
                </td>
            </tr>`);
            row.appendTo('#product_rows');
        }
        
        renderPageButtons(); 
    }

    function renderPageButtons()
    {
        const initialWidth = 42;
        const documentWidth = $(document).width(); 
        const maxWidthPercentage = 0.3; 
        $('#page_buttons').html('');
        if (searchedProducts.length > 0)
        {
            maxPage = Math.ceil(searchedProducts.length / pageSize);
            $('#page_buttons').append($(`<button class='activePageButton' data-page='${currentPage}'>${currentPage + 1}</button>`));
            let currentWidth = initialWidth; 
            for (let i = 1; i < maxPage; i++)
            {
                if ((currentWidth + 90) / documentWidth <= maxWidthPercentage)
                {
                    let index = currentPage - i;
                    if (index >= 0)
                    {
                        $('#page_buttons').prepend($(`<button class='inactivePageButton' data-page='${index}'>${index + 1}</button>`));
                        currentWidth += 45; 
                    }

                    index = currentPage + i;
                    if (index < maxPage)
                    {
                        $('#page_buttons').append($(`<button class='inactivePageButton' data-page='${index}'>${index + 1}</button>`));
                        currentWidth += 45; 
                    }
                } else break;
            }

            if (searchedProducts.length > pageSize)
            {
                $('#page_buttons').prepend('<i class="fa-solid fa-angles-left pointer" id="back"></i>');
                $('#page_buttons').append('<i class="fa-solid fa-angles-right pointer" id="next"></i>');
            }
        }  
    }

    // function for testing pagination system
    function addFakeProducts(number)
    {
        for (let i = 0; i < number; i++)
        {
            let product = {
                productName: 'Product #' + i,
                categoryId: 1,
                unitsInStock: 0,
                reorderLevel: 0
            };
    
            products.push(product);
        }
    }

    $('#product_search').on('input', function()
    {
        // reset page
        currentPage = 0; 
        // render products
        renderProducts();
    });

    $('#product_categories').on('change', function()
    {
        // reset page
        currentPage = 0;
        // render products
        renderProducts(); 
    });

    function setActive(element)
    {
        $('.active').each(function()
        {
            // reset other active classes
            $(this).removeClass('active').addClass('inactive');
        });

        element.removeClass('inactive').addClass('active'); 
        
        // invert icon angle and return it's state
        let icon = element.children('i');
        if (icon.hasClass('fa-angle-down'))
        {
            icon.removeClass('fa-angle-down').addClass('fa-angle-up');
            return true;
        } else
        {
            icon.removeClass('fa-angle-up').addClass('fa-angle-down');
            return false; 
        }
    }

    $('#nameHeader').on('click', function()
    {
        let isUp = setActive($(this));
        if (isUp)
            currentSort = (a, b) => -a.productName.localeCompare(b.productName);
        else
            currentSort = (a, b) => a.productName.localeCompare(b.productName); 

        renderProducts(); 
    });

    $('#categoryHeader').on('click', function()
    {
        let isUp = setActive($(this));
        if (isUp)
            currentSort = (a, b) => -getCategoryName(a.categoryId).localeCompare(getCategoryName(b.categoryId));
        else
            currentSort = (a, b) => getCategoryName(a.categoryId).localeCompare(getCategoryName(b.categoryId));

        renderProducts(); 
    });

    $('#unitsHeader').on('click', function()
    {
        let isUp = setActive($(this)); 

        if (isUp)
            currentSort = (a, b) => b.unitsInStock - a.unitsInStock;
        else
            currentSort = (a, b) => a.unitsInStock - b.unitsInStock;

        renderProducts(); 
    });

    $('#reorderHeader').on('click', function()
    {
        let isUp = setActive($(this)); 
        if (isUp)
            currentSort = (a, b) => b.reorderLevel - a.reorderLevel;
        else
            currentSort = (a, b) => a.reorderLevel - b.reorderLevel; 

        renderProducts();
    });

    $('#page_buttons').on('click', 'button', function()
    {
        currentPage = $(this).data('page');
        renderProducts();
    });

    $('#page_buttons').on('click', 'i', function()
    {
        let old = currentPage;

        if ($(this).attr('id') == 'back')
        {
            currentPage--;
            if (currentPage < 0)
                currentPage = maxPage - 1;
        } else
        {
            currentPage++;
            if (currentPage >= maxPage)
                currentPage = 0;
        }
        
        // render products if page has changed
        if (old != currentPage)
            renderProducts();
    });

    $(window).on('resize', function()
    {
        // update buttons if page size changes
        renderPageButtons();
    });

    $(document).on('change', '.stock_input', async function()
    {
        let productId = $(this).data('product-id'); 
        products.find(p => p.productId == productId).unitsInStock = Number($(this).val()); 
        await $.ajax({
            type: 'POST',
            url: './EditProductStock',
            contentType: 'application/json',
            data: JSON.stringify({
                id: productId,
                stock: $(this).val()
            }), 
            error: function()
            {
                console.log('Failed to update product stock!');
            }
        });

        renderProducts(); 
    });

    $(document).on('change', '.reorder_input', async function()
    {
        let productId = $(this).data('product-id'); 
        products.find(p => p.productId == productId).reorderLevel = Number($(this).val()); 
        await $.ajax({
            type: 'POST',
            url: './EditProductReorderLevel',
            contentType: 'application/json',
            data: JSON.stringify({
                id: productId,
                reorderLevel: $(this).val()
            }), 
            error: function()
            {
                console.log('Failed to update product stock!');
            }
        });

        renderProducts(); 
    });
});