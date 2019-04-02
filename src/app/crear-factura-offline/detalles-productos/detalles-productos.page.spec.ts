import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetallesProductosPage } from './detalles-productos.page';

describe('DetallesProductosPage', () => {
  let component: DetallesProductosPage;
  let fixture: ComponentFixture<DetallesProductosPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DetallesProductosPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetallesProductosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
