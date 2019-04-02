import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuCrearFacturaPage } from './menu-crear-factura.page';

describe('MenuCrearFacturaPage', () => {
  let component: MenuCrearFacturaPage;
  let fixture: ComponentFixture<MenuCrearFacturaPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MenuCrearFacturaPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuCrearFacturaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
